import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Image, Upload, Sparkles, Copy, Check, Loader2 } from 'lucide-react';
import { Card, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Tag } from '../../components/common/Tag';
import { Spinner } from '../../components/common/Spinner';
import { useTaskStore } from '../../stores/taskStore';
import { useStatsStore } from '../../stores/statsStore';
import { processImageText } from '../../services/aiService';

export const ImagePage: React.FC = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [extractedTexts, setExtractedTexts] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasProcessed, setHasProcessed] = useState(false);

  const { addTask, setTaskOutputs, tasks } = useTaskStore();
  const { recordUsage } = useStatsStore();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setHasProcessed(false);
        setExtractedTexts([]);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    },
    maxFiles: 1,
  });

  const handleProcess = async () => {
    if (!uploadedImage) return;

    setIsProcessing(true);
    setHasProcessed(true);

    try {
      const texts = await processImageText(uploadedImage);
      setExtractedTexts(texts);

      addTask('image_analysis', '图片文字提取');
      const latestTask = tasks[0];
      if (latestTask) {
        const taskOutputs = texts.map((content, index) => ({
          content,
          version: `文本${index + 1}`,
          sensitiveWords: [],
          isMarked: false,
          markStatus: 'pending' as const,
        }));
        setTaskOutputs(latestTask.id, taskOutputs);
      }

      recordUsage('image_analysis', true);
    } catch (error) {
      console.error('Failed to process image:', error);
      recordUsage('image_analysis', false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(extractedTexts.join('\n'));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">图片处理</h1>
        <p className="text-gray-600 mt-1">竞品分析、卖点提取、文字识别</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardBody className="p-6">
            <h3 className="font-bold text-gray-900 mb-4">上传图片</h3>

            {!uploadedImage ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                  isDragActive
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-300 hover:border-primary-400'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  拖拽图片到此处，或点击上传
                </p>
                <p className="text-sm text-gray-600">
                  支持 JPG、PNG、GIF、WebP 格式
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden bg-gray-100">
                  <img
                    src={uploadedImage}
                    alt="Uploaded"
                    className="w-full h-auto max-h-96 object-contain"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleProcess}
                    isLoading={isProcessing}
                    leftIcon={<Sparkles className="w-4 h-4" />}
                    className="flex-1"
                  >
                    提取文字
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setUploadedImage(null);
                      setExtractedTexts([]);
                      setHasProcessed(false);
                    }}
                  >
                    重新上传
                  </Button>
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">提取结果</h3>
              {extractedTexts.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Copy className="w-4 h-4" />}
                  onClick={handleCopyAll}
                >
                  复制全部
                </Button>
              )}
            </div>

            {isProcessing && (
              <div className="flex items-center justify-center py-12">
                <Spinner size="lg" />
              </div>
            )}

            {!isProcessing && extractedTexts.length > 0 && (
              <div className="space-y-3">
                {extractedTexts.map((text, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 rounded-xl flex items-start gap-3"
                  >
                    <Tag variant="primary">{index + 1}</Tag>
                    <p className="text-gray-900 flex-1">{text}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(text)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {!isProcessing && extractedTexts.length === 0 && !hasProcessed && (
              <div className="text-center py-12">
                <Image className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  上传图片后，系统将自动提取图片中的文字信息
                </p>
              </div>
            )}

            {!isProcessing && extractedTexts.length === 0 && hasProcessed && (
              <div className="text-center py-12">
                <p className="text-gray-500">未能从图片中提取到文字信息</p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
        <CardBody className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Image className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">图片处理功能说明</h3>
              <div className="text-sm text-gray-700 space-y-2">
                <p>• <strong>文字提取</strong>：自动识别图片中的文字内容</p>
                <p>• <strong>卖点提取</strong>：从商品主图中识别核心卖点信息</p>
                <p>• <strong>竞品分析</strong>：上传竞品图片，提取关键营销信息</p>
                <p className="text-gray-500 mt-2">
                  提示：上传商品主图或竞品宣传图效果更佳
                </p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
