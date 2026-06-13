import { TaskType, SmsParams, SmsResult, CompetitorInfo } from '../types';
import { checkSensitiveWords } from '../utils/checkSensitive';

const PRODUCT_CATEGORIES = ['服装', '数码', '美妆', '食品', '家居', '母婴', '鞋包', '运动', '家电', '图书'];
const TITLE_PREFIXES = ['2024新款', '爆款推荐', '热销', '限时特惠', '品质之选', '明星同款', '工厂直销', '爆卖'];
const TITLE_SUFFIXES = ['亏本清仓', '限时秒杀', '错过等一年', '火爆全网', '好评如潮', '回头客无数', '超高性价比', '超值推荐'];
const SELLING_POINT_STYLES = ['专业严谨', '亲切温暖', '幽默风趣', '简洁明了', '情感共鸣'];

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function randomPick<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export async function generateTitles(keywords: string, category: string): Promise<string[]> {
  await delay(800 + Math.random() * 700);

  const titles: string[] = [];
  const prefixes = randomPick(TITLE_PREFIXES, 5);
  const suffixes = randomPick(TITLE_SUFFIXES, 5);

  for (let i = 0; i < 10; i++) {
    const prefix = i < 5 ? prefixes[i % prefixes.length] : '';
    const keyword = keywords.split(/[,，]/)[i % keywords.split(/[,，]/).length];
    const suffix = suffixes[i % suffixes.length];

    let title = prefix ? `${prefix}${keyword}${suffix}` : `${keyword}${suffix}`;
    if (category && i % 3 === 0) {
      title = `${category}${keyword} ${prefix || suffix}`;
    }

    titles.push(title);
  }

  return titles;
}

export async function rewriteSellingPoints(text: string, style?: string): Promise<string[]> {
  await delay(600 + Math.random() * 500);

  const versions: string[] = [];
  const styles = style ? [style] : randomPick(SELLING_POINT_STYLES, 5);

  styles.forEach((s, index) => {
    let rewritten = text;

    if (s === '专业严谨') {
      rewritten = `【产品核心卖点】\n${text}\n\n✅ 品质保证\n✅ 源头直供\n✅ 质检合格`;
    } else if (s === '亲切温暖') {
      rewritten = `亲，您想要的品质好物来啦～\n${text}\n\n💖 用心服务每一位顾客\n💖 期待与您的美好相遇`;
    } else if (s === '幽默风趣') {
      rewritten = `哎呦，不得了！\n${text}\n\n😎 买它买它就买它\n😎 不买后悔系列来袭`;
    } else if (s === '简洁明了') {
      rewritten = `${text}\n• 源头直采\n• 品质保障\n• 超值价格`;
    } else if (s === '情感共鸣') {
      rewritten = `每一个细节，都是为了遇见更好的你\n${text}\n\n✨ 陪伴你的每一刻\n✨ 值得拥有的好物`;
    }

    versions.push(rewritten);
  });

  return versions;
}

export async function generateSms(params: SmsParams): Promise<SmsResult[]> {
  await delay(500 + Math.random() * 400);

  const activityTexts: Record<string, string> = {
    festival: '节日大促',
    new_product: '新品首发',
    member: '会员专享',
    clearance: '清仓特卖',
  };

  const platformTexts: Record<string, string> = {
    taobao: '淘宝',
    jd: '京东',
    pinduoduo: '拼多多',
  };

  const results: SmsResult[] = [
    {
      content: `【${platformTexts[params.platform]}】${params.discount}！限时${activityTexts[params.activityType]}，错过不再有！`,
      length: 'short',
      estimatedCost: 0.05,
    },
    {
      content: `【${platformTexts[params.platform]}】${params.discount}！${params.startDate}-${params.endDate} ${activityTexts[params.activityType]}，多款爆品限时抢！`,
      length: 'medium',
      estimatedCost: 0.05,
    },
    {
      content: `【${platformTexts[params.platform]}】${params.discount}大促来袭！${params.startDate}-${params.endDate} ${activityTexts[params.activityType]}，全网超低价，限时${params.discount}！${params.link || '点击查看更多优惠'}。退订回T`,
      length: 'long',
      estimatedCost: 0.1,
    },
  ];

  return results;
}

export async function generateReviewReply(review: string, tone: string): Promise<string[]> {
  await delay(700 + Math.random() * 600);

  const toneReplies: Record<string, string[]> = {
    professional: [
      `尊敬的顾客您好，感谢您的反馈。我们非常重视您的意见，已将问题转交相关部门处理。如有任何疑问，请随时联系我们的客服团队，祝您生活愉快！`,
      `您好，感谢您选择我们的产品。您的反馈对我们非常重要，我们会不断提升产品和服务质量，期待为您提供更好的购物体验！`,
    ],
    friendly: [
      `亲，感谢您的支持与信任！您的满意是我们最大的动力～有任何问题随时联系我们哦，祝您生活愉快！🌸`,
      `亲爱的顾客，非常感谢您的认可！我们会继续努力，为您带来更好的产品和服务～期待下次光临！💖`,
    ],
    humorous: [
      `哎呀，被您发现了小问题！我们的团队已经紧急"出动"啦，保证给您一个满意的答复！感谢您的理解～😄`,
      `哈哈，感谢您的"火眼金睛"！我们一定吸取教训，争取做到完美！祝您天天好心情～🎉`,
    ],
    formal: [
      `尊敬的客户，感谢您的宝贵反馈。我司高度重视本次问题，已启动调查程序，并将尽快与您联系处理。再次感谢您的理解与支持。`,
      `您好，感谢您对本品牌的支持。您的反馈已收到，我司将认真评估并改进。期待继续为您服务，谢谢。`,
    ],
  };

  const replies = toneReplies[tone] || toneReplies.professional;
  return replies;
}

export async function extractCompetitorInfo(imageText: string): Promise<CompetitorInfo> {
  await delay(1000 + Math.random() * 800);

  return {
    name: '竞品店铺',
    price: '¥299',
    sellingPoints: [
      '高品质材质',
      '精美工艺',
      '时尚设计',
      '性价比高',
      '服务优质',
    ],
    marketingStrategies: [
      '限时折扣',
      '满减活动',
      '赠品促销',
      '会员积分',
      '社交营销',
    ],
    extractedText: imageText ? imageText.split('\n').filter(Boolean) : [
      '店铺名称：优品汇',
      '主营：时尚精品',
      '联系方式：400-888-8888',
    ],
  };
}

export async function processImageText(imageUrl: string): Promise<string[]> {
  await delay(1200 + Math.random() * 1000);

  return [
    '【爆款热卖中】',
    '新品上市 全网首发',
    '限时特惠 ¥199',
    '品质保证 售后无忧',
    '累计销量突破10万+',
  ];
}
