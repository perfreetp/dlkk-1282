import React, { useState, useEffect } from 'react';
import { MessageSquare, Star, Copy, AlertTriangle, Check, Sparkles } from 'lucide-react';
import { Card, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Textarea } from '../../components/common/Input';
import { Tag } from '../../components/common/Tag';
import { Spinner } from '../../components/common/Spinner';
import { useTaskStore } from '../../stores/taskStore';
import { useStatsStore } from '../../stores/statsStore';
import { useUserStore } from '../../stores/userStore';
import { generateReviewReply } from '../../services/aiService';
import { validateSensitive } from '../../services/sensitiveService';
import { ToneStyle } from '../../types';

const toneOptions: { value: ToneStyle; label: string; description: string }[] = [
  { value: 'professional', label: '专业严谨', description: '正式、专业的客服风格' },
  { value: 'friendly', label: '亲切温暖', description: '友好、亲切的服务态度' },
  { value: 'humorous', label: '幽默风趣', description: '轻松、幽默的互动方式' },
  { value: 'formal', label: '严肃正式', description: '商务、正式的表达' },
];

export const Service: React.FC = () => {
  const [reviewText, setReviewText] = useState('');
  const [selectedTone, setSelectedTone] = useState<ToneStyle>('friendly');
  const [replies, setReplies] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [sensitiveResult, setSensitiveResult] = useState<any>(null);

  const { addTask, setTaskOutputs, tasks } = useTaskStore();
  const { recordUsage } = useStatsStore();
  const { addTemplate } = useUserStore();

  const handleGenerateReplies = async () => {
    if (!reviewText.trim()) return;

    setIsLoading(true);
    setHasGenerated(true);
    setSensitiveResult(null);
    setSelectedIndex(-1);

    try {
      const generatedReplies = await generateReviewReply(reviewText, selectedTone);
      setReplies(generatedReplies);

      addTask('review_reply', reviewText);
      const latestTask = tasks[0];
      if (latestTask) {
        const taskOutputs = generatedReplies.map((content, index) => ({
          content,
          version: `方案${index + 1}`,
          sensitiveWords: [],
          isMarked: false,
          markStatus: 'pending' as const,
        }));
        setTaskOutputs(latestTask.id, taskOutputs);
      }

      if (generatedReplies[0]) {
        const result = validateSensitive(generatedReplies[0]);
        setSensitiveResult(result);
      }

      recordUsage('review_reply', true);
    } catch (error) {
      console.error('Failed to generate replies:', error);
      recordUsage('review_reply', false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectReply = (index: number) => {
    setSelectedIndex(index);
    if (replies[index]) {
      const result = validateSensitive(replies[index]);
      setSensitiveResult(result);
    }
  };

  const handleCopySelected = () => {
    if (selectedIndex >= 0 && replies[selectedIndex]) {
      navigator.clipboard.writeText(replies[selectedIndex]);
    }
  };

  const handleSaveAsTemplate = () => {
    if (selectedIndex >= 0 && replies[selectedIndex]) {
      addTemplate({
        name: `话术-${Date.now()}`,
        type: 'review_reply',
        content: replies[selectedIndex],
        tags: [selectedTone],
        usageCount: 0,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">客服话术</h1>
        <p className="text-gray-600 mt-1">智能生成差评回复，管理常用话术模板</p>
      </div>

      <Card>
        <CardBody className="p-6">
          <div className="space-y-6">
            <Textarea
              label="差评内容"
              placeholder="粘贴买家差评内容，AI 将自动生成多种回复方案"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={4}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                选择回复语气
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {toneOptions.map((tone) => (
                  <button
                    key={tone.value}
                    onClick={() => setSelectedTone(tone.value)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      selectedTone === tone.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900 mb-1">{tone.label}</div>
                    <div className="text-xs text-gray-600">{tone.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleGenerateReplies}
              isLoading={isLoading}
              disabled={!reviewText.trim()}
              leftIcon={<Sparkles className="w-4 h-4" />}
              className="w-full"
            >
              生成回复方案
            </Button>
          </div>
        </CardBody>
      </Card>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      )}

      {!isLoading && hasGenerated && replies.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">生成结果</h2>
            <div className="flex gap-2">
              {selectedIndex >= 0 && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<Copy className="w-4 h-4" />}
                    onClick={handleCopySelected}
                  >
                    复制
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Star className="w-4 h-4" />}
                    onClick={handleSaveAsTemplate}
                  >
                    收藏
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {replies.map((reply, index) => (
              <Card
                key={index}
                hover
                onClick={() => handleSelectReply(index)}
                className={`cursor-pointer transition-all ${
                  selectedIndex === index
                    ? 'ring-2 ring-primary-500 shadow-lg'
                    : ''
                }`}
              >
                <CardBody className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <Tag variant={selectedIndex === index ? 'primary' : 'default'}>
                      方案 {index + 1}
                    </Tag>
                    {selectedIndex === index && (
                      <Check className="w-5 h-5 text-primary-600" />
                    )}
                  </div>
                  <p className="text-gray-900 whitespace-pre-wrap">{reply}</p>
                </CardBody>
              </Card>
            ))}
          </div>

          {sensitiveResult && (
            <Card className={sensitiveResult.hasRisk ? 'border-danger-200' : 'border-success-200'}>
              <CardBody className="p-6">
                <div className="flex items-start gap-3">
                  {sensitiveResult.hasRisk ? (
                    <AlertTriangle className="w-6 h-6 text-danger-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Check className="w-6 h-6 text-success-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h3 className={`font-bold mb-2 ${sensitiveResult.hasRisk ? 'text-danger-700' : 'text-success-700'}`}>
                      {sensitiveResult.hasRisk ? '敏感词检测' : '文案检测通过'}
                    </h3>
                    {sensitiveResult.hasRisk ? (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          发现 {sensitiveResult.words.length} 个风险词
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {sensitiveResult.words.map((word: any, idx: number) => (
                            <Tag key={idx} variant="danger">
                              {word.word}
                            </Tag>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">
                        当前文案未检测到敏感词，可以放心使用。
                      </p>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </>
      )}

      {!isLoading && !hasGenerated && (
        <Card className="border-dashed border-2 border-gray-300">
          <CardBody className="p-12 text-center">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">开始生成回复</h3>
            <p className="text-gray-600">
              输入差评内容，选择合适的语气风格，AI 将为你生成多种回复方案
            </p>
          </CardBody>
        </Card>
      )}
    </div>
  );
};
