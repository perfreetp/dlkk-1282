export type TaskType = 'title' | 'selling_point' | 'sms' | 'review_reply' | 'competitor_analysis' | 'image_analysis';

export type MarkStatus = 'available' | 'pending' | 'rejected';

export type UserRole = 'member' | 'supervisor';

export type ToneStyle = 'professional' | 'friendly' | 'humorous' | 'formal';

export type SensitiveWordType = 'forbidden' | 'extreme' | 'false_claim';

export interface Output {
  content: string;
  version: string;
  sensitiveWords: string[];
  isMarked: boolean;
  markStatus: MarkStatus;
}

export interface Task {
  id: string;
  type: TaskType;
  input: string;
  category?: string;
  outputs: Output[];
  selectedIndex: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  notes?: string;
}

export interface BrandTone {
  id: string;
  name: string;
  description: string;
  style: ToneStyle;
  forbiddenWords: string[];
  commonPhrases: string[];
  createdBy: string;
  createdAt: Date;
  isTeamShared: boolean;
}

export interface UsageStats {
  date: string;
  taskType: TaskType;
  count: number;
  successCount: number;
  userId: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  teamId?: string;
  avatar?: string;
  createdAt: Date;
}

export interface Template {
  id: string;
  name: string;
  type: TaskType;
  content: string;
  tags: string[];
  usageCount: number;
  conversionRate?: number;
  createdAt: Date;
  userId: string;
}

export interface SensitiveWord {
  word: string;
  type: SensitiveWordType;
  position: number;
  suggestion?: string;
}

export interface SensitiveCheckResult {
  hasRisk: boolean;
  words: SensitiveWord[];
  suggestions: string[];
}

export interface SmsParams {
  activityType: 'festival' | 'new_product' | 'member' | 'clearance';
  platform: 'taobao' | 'jd' | 'pinduoduo';
  discount: string;
  startDate: string;
  endDate: string;
  link?: string;
}

export interface SmsResult {
  content: string;
  length: 'short' | 'medium' | 'long';
  estimatedCost: number;
}

export interface CompetitorInfo {
  name: string;
  price: string;
  sellingPoints: string[];
  marketingStrategies: string[];
  extractedText: string[];
}
