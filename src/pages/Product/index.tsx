import React, { useState, useEffect } from 'react';
import { Sparkles, AlertTriangle, Check, Star, Copy } from 'lucide-react';
import { Card, CardBody, CardHeader, CardFooter } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input, Textarea } from '../../components/common/Input';
import { Tag } from '../../components/common/Tag';
import { Alert } from '../../components/common/Alert';
import { Spinner, CardSkeleton } from '../../components/common/Spinner';
import { useTaskStore } from '../../stores/taskStore';
import { useStatsStore } from '../../stores/statsStore';
import { useUserStore } from '../../stores/userStore';
import { generateTitles, rewriteSellingPoints } from '../../services/aiService';
import { validateSensitive, getRiskLevel, suggestFixes } from '../../services/sensitiveService';
import { SensitiveCheckResult } from '../../types';

const categories = [
  '服装', '数码', '美妆', '食品', '家居',
  '母婴', '鞋包', '运动', '家电', '图书',
];

export const Product: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'title' | 'selling_point'>('title');
  const [keywords, setKeywords] = useState('');
  const [category, setCategory] = useState('服装');
  const [sellingPoint, setSellingPoint] = useState('');
  const [outputs, setOutputs] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [sensitiveResult, setSensitiveResult] = useState<SensitiveCheckResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const { addTask, setTaskOutputs, tasks } = useTaskStore();
  const { recordUsage } = useStatsStore();
  const { addTemplate } = useUserStore();

  const handleGenerateTitles = async () => {
    if (!keywords.trim()) return;

    setIsLoading(true);
    setHasGenerated(true);
    setSensitiveResult(null);
    setSelectedIndex(-1);

    try {
      const titles = await generateTitles(keywords, category);
      setOutputs(titles);

      addTask('title', keywords, category);
      const latestTask = tasks[0];
      if (latestTask) {
        const taskOutputs = titles.map((content, index) => ({
          content,
          version: `版本${index + 1}`,
          sensitiveWords: [],
          isMarked: false,
          markStatus: 'pending' as const,
        }));
        setTaskOutputs(latestTask.id, taskOutputs);
      }

      if (titles[0]) {
        const result = validateSensitive(titles[0]);
        setSensitiveResult(result);
      }

      recordUsage('title', true);
    } catch (error) {
      console.error('Failed to generate titles:', error);
      recordUsage('title', false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRewriteSellingPoints = async () => {
    if (!sellingPoint.trim()) return;

    setIsLoading(true);
    setHasGenerated(true);
    setSensitiveResult(null);
    setSelectedIndex(-1);

    try {
      const rewritten = await rewriteSellingPoints(sellingPoint);
      setOutputs(rewritten);

      addTask('selling_point', sellingPoint);
      const latestTask = tasks[0];
      if (latestTask) {
        const taskOutputs = rewritten.map((content, index) => ({
          content,
          version: `风格${index + 1}`,
          sensitiveWords: [],
          isMarked: false,
          markStatus: 'pending' as const,
        }));
        setTaskOutputs(latestTask.id, taskOutputs);
      }

      if (rewritten[0]) {
        const result = validateSensitive(rewritten[0]);
        setSensitiveResult(result);
      }

      recordUsage('selling_point', true);
    } catch (error) {
      console.error('Failed to rewrite selling points:', error);
      recordUsage('selling_point', false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOutput = (index: number) => {
    setSelectedIndex(index);
    if (outputs[index]) {
      const result = validateSensitive(outputs[index]);
      setSensitiveResult(result);
    }
  };

  const handleCopySelected = () => {
    if (selectedIndex >= 0 && outputs[selectedIndex]) {
      navigator.clipboard.writeText(outputs[selectedIndex]);
    }
  };

  const handleSaveAsTemplate = () => {
    if (selectedIndex >= 0 && outputs[selectedIndex]) {
      addTemplate({
        name: `模板-${Date.now()}`,
        type: activeTab === 'title' ? 'title' : 'selling_point',
        content: outputs[selectedIndex],
        tags: [category],
        usageCount: 0,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">商品文案</h1>
          <p className="text-gray-600 mt-1">生成优质标题，改写卖点，检测敏感词</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('title')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'title'
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Sparkles className="w-5 h-5 mx-auto mb-1" />
            生成标题
          </button>
          <button
            onClick={() => setActiveTab('selling_point')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'selling_point'
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Star className="w-5 h-5 mx-auto mb-1" />
            改写卖点
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'title' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Input
                    label="商品关键词"
                    placeholder="输入商品关键词，多个关键词用逗号分隔"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    商品类目
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <Button
                onClick={handleGenerateTitles}
                isLoading={isLoading}
                disabled={!keywords.trim()}
                leftIcon={<Sparkles className="w-4 h-4" />}
                className="w-full"
              >
                一键生成 10 个标题
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Textarea
                label="原始卖点文案"
                placeholder="粘贴原始卖点文案，系统将生成5种不同风格的版本"
                value={sellingPoint}
                onChange={(e) => setSellingPoint(e.target.value)}
                rows={4}
              />
              <Button
                onClick={handleRewriteSellingPoints}
                isLoading={isLoading}
                disabled={!sellingPoint.trim()}
                leftIcon={<Star className="w-4 h-4" />}
                className="w-full"
              >
                批量改写 5 种风格
              </Button>
            </div>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(5)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      )}

      {!isLoading && hasGenerated && outputs.length > 0 && (
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {outputs.map((output, index) => (
              <Card
                key={index}
                hover
                onClick={() => handleSelectOutput(index)}
                className={`cursor-pointer transition-all ${
                  selectedIndex === index
                    ? 'ring-2 ring-primary-500 shadow-lg'
                    : ''
                }`}
              >
                <CardBody className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <Tag variant={selectedIndex === index ? 'primary' : 'default'}>
                      {activeTab === 'title' ? `标题 ${index + 1}` : `风格 ${index + 1}`}
                    </Tag>
                    {selectedIndex === index && (
                      <Check className="w-5 h-5 text-primary-600" />
                    )}
                  </div>
                  <p className="text-gray-900 whitespace-pre-wrap">{output}</p>
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
                      {sensitiveResult.hasRisk ? '敏感词检测结果' : '文案检测通过'}
                    </h3>
                    {sensitiveResult.hasRisk ? (
                      <div className="space-y-3">
                        <p className="text-sm text-gray-600">
                          发现 {sensitiveResult.words.length} 个潜在风险词：
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {sensitiveResult.words.map((word, idx) => (
                            <Tag key={idx} variant="danger">
                              {word.word}
                              {word.suggestion && ` → ${word.suggestion}`}
                            </Tag>
                          ))}
                        </div>
                        {suggestFixes(sensitiveResult).length > 0 && (
                          <div className="mt-3 p-3 bg-danger-50 rounded-xl">
                            <p className="text-sm font-medium text-danger-700 mb-2">修改建议：</p>
                            <ul className="text-sm text-danger-600 space-y-1">
                              {suggestFixes(sensitiveResult).map((suggestion, idx) => (
                                <li key={idx}>{suggestion}</li>
                              ))}
                            </ul>
                          </div>
                        )}
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
            <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">开始生成文案</h3>
            <p className="text-gray-600">
              输入关键词或卖点文案，AI 将为你生成多个优化版本
            </p>
          </CardBody>
        </Card>
      )}
    </div>
  );
};
