import React, { useState } from 'react';
import { MessageCircle, Sparkles, Copy, Check, AlertTriangle, Smartphone } from 'lucide-react';
import { Card, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Tag } from '../../components/common/Tag';
import { Spinner } from '../../components/common/Spinner';
import { useTaskStore } from '../../stores/taskStore';
import { useStatsStore } from '../../stores/statsStore';
import { generateSms } from '../../services/aiService';
import { countSmsChars, estimateSmsCost } from '../../utils/formatters';
import { SmsParams, SmsResult } from '../../types';

const activityTypes = [
  { value: 'festival', label: '节日促销', icon: '🎉' },
  { value: 'new_product', label: '新品首发', icon: '✨' },
  { value: 'member', label: '会员专享', icon: '💎' },
  { value: 'clearance', label: '清仓处理', icon: '🏷️' },
];

const platforms = [
  { value: 'taobao', label: '淘宝' },
  { value: 'jd', label: '京东' },
  { value: 'pinduoduo', label: '拼多多' },
];

export const Sms: React.FC = () => {
  const [activityType, setActivityType] = useState<string>('festival');
  const [platform, setPlatform] = useState<string>('taobao');
  const [discount, setDiscount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [link, setLink] = useState('');
  const [results, setResults] = useState<SmsResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [copied, setCopied] = useState(false);

  const { addTask, setTaskOutputs, tasks } = useTaskStore();
  const { recordUsage } = useStatsStore();

  const handleGenerate = async () => {
    if (!discount || !startDate || !endDate) return;

    setIsLoading(true);
    setHasGenerated(true);
    setSelectedIndex(-1);

    try {
      const params: SmsParams = {
        activityType: activityType as any,
        platform: platform as any,
        discount,
        startDate,
        endDate,
        link,
      };

      const smsResults = await generateSms(params);
      setResults(smsResults);

      addTask('sms', `${activityType} - ${discount}`);
      const latestTask = tasks[0];
      if (latestTask) {
        const taskOutputs = smsResults.map((r, index) => ({
          content: r.content,
          version: r.length === 'short' ? '短版' : r.length === 'medium' ? '中版' : '长版',
          sensitiveWords: [],
          isMarked: false,
          markStatus: 'pending' as const,
        }));
        setTaskOutputs(latestTask.id, taskOutputs);
      }

      recordUsage('sms', true);
    } catch (error) {
      console.error('Failed to generate SMS:', error);
      recordUsage('sms', false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectResult = (index: number) => {
    setSelectedIndex(index);
  };

  const handleCopy = async () => {
    if (selectedIndex >= 0 && results[selectedIndex]) {
      await navigator.clipboard.writeText(results[selectedIndex].content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">活动短信</h1>
        <p className="text-gray-600 mt-1">生成活动短信，字符统计，平台适配</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardBody className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    活动类型
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {activityTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setActivityType(type.value)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          activityType === type.value
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-primary-300'
                        }`}
                      >
                        <div className="text-2xl mb-1">{type.icon}</div>
                        <div className="text-sm font-medium">{type.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    目标平台
                  </label>
                  <div className="flex gap-3">
                    {platforms.map((p) => (
                      <button
                        key={p.value}
                        onClick={() => setPlatform(p.value)}
                        className={`px-6 py-2.5 rounded-xl border-2 transition-all font-medium ${
                          platform === p.value
                            ? 'border-primary-500 bg-primary-50 text-primary-600'
                            : 'border-gray-200 hover:border-primary-300'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="优惠力度"
                    placeholder="如：5折、满100减30"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                  />
                  <Input
                    label="开始日期"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <Input
                    label="结束日期"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>

                <Input
                  label="活动链接（可选）"
                  placeholder="输入活动链接"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                />

                <Button
                  onClick={handleGenerate}
                  isLoading={isLoading}
                  disabled={!discount || !startDate || !endDate}
                  leftIcon={<Sparkles className="w-4 h-4" />}
                  className="w-full"
                >
                  生成短信文案
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        <div>
          <Card className="sticky top-6">
            <CardBody className="p-6">
              <h3 className="font-bold text-gray-900 mb-4">短信预览</h3>
              {selectedIndex >= 0 && results[selectedIndex] ? (
                <div className="space-y-4">
                  <div className="bg-gray-900 rounded-2xl p-4 relative">
                    <Smartphone className="absolute top-2 left-2 w-4 h-4 text-gray-600" />
                    <p className="text-white text-sm mt-4">
                      {results[selectedIndex].content}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">字符数</span>
                    <span className="font-semibold">
                      {countSmsChars(results[selectedIndex].content)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">预估费用</span>
                    <span className="font-semibold text-success-600">
                      ¥{results[selectedIndex].estimatedCost.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">短信条数</span>
                    <span className="font-semibold">
                      {countSmsChars(results[selectedIndex].content) <= 70 ? 1 : Math.ceil(countSmsChars(results[selectedIndex].content) / 67)}
                    </span>
                  </div>
                  <Button
                    onClick={handleCopy}
                    variant={copied ? 'secondary' : 'primary'}
                    className="w-full"
                    leftIcon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  >
                    {copied ? '已复制' : '复制短信'}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Smartphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">选择下方短信版本进行预览</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      )}

      {!isLoading && hasGenerated && results.length > 0 && (
        <>
          <h2 className="text-xl font-bold text-gray-900">生成结果</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {results.map((result, index) => (
              <Card
                key={index}
                hover
                onClick={() => handleSelectResult(index)}
                className={`cursor-pointer transition-all ${
                  selectedIndex === index
                    ? 'ring-2 ring-primary-500 shadow-lg'
                    : ''
                }`}
              >
                <CardBody className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <Tag
                      variant={
                        result.length === 'short'
                          ? 'success'
                          : result.length === 'medium'
                          ? 'warning'
                          : 'primary'
                      }
                    >
                      {result.length === 'short' ? '短版' : result.length === 'medium' ? '中版' : '长版'}
                    </Tag>
                    {selectedIndex === index && <Check className="w-5 h-5 text-primary-600" />}
                  </div>
                  <p className="text-gray-900 text-sm mb-3">{result.content}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{countSmsChars(result.content)} 字符</span>
                    <span>¥{result.estimatedCost.toFixed(2)}</span>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </>
      )}

      {!isLoading && !hasGenerated && (
        <Card className="border-dashed border-2 border-gray-300">
          <CardBody className="p-12 text-center">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">开始生成短信</h3>
            <p className="text-gray-600">
              填写活动信息，选择平台，AI 将为你生成适配的短信文案
            </p>
          </CardBody>
        </Card>
      )}
    </div>
  );
};
