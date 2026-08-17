const { createCanvas, GlobalFonts } = require('@napi-rs/canvas');
const path = require('path');
const fs = require('fs');

// ===============================
// تحميل الخط العربي بشكل آمن
// ===============================

const fontPath = path.join(
  __dirname,
  '..',
  'fonts',
  'NotoSansArabic-Regular.ttf'
);

let FONT = 'sans-serif';

try {
  if (fs.existsSync(fontPath)) {
    const loaded = GlobalFonts.registerFromPath(
      fontPath,
      'NotoSansArabic'
    );

    if (loaded) {
      FONT = 'NotoSansArabic';
      console.log('✅ تم تحميل الخط العربي');
    } else {
      console.log('⚠️ تعذر تسجيل الخط العربي - سيتم استخدام الخط الافتراضي');
    }
  } else {
    console.log('⚠️ ملف الخط غير موجود - سيتم استخدام الخط الافتراضي');
  }
} catch (error) {
  console.log('⚠️ مشكلة في الخط:', error.message);
}

// ===============================
// أدوات الرسم
// ===============================

function drawRoundedRect(ctx, x, y, w, h, r = 15) {
  ctx.beginPath();

  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);

  ctx.quadraticCurveTo(
    x + w,
    y,
    x + w,
    y + r
  );

  ctx.lineTo(x + w, y + h - r);

  ctx.quadraticCurveTo(
    x + w,
    y + h,
    x + w - r,
    y + h
  );

  ctx.lineTo(x + r, y + h);

  ctx.quadraticCurveTo(
    x,
    y + h,
    x,
    y + h - r
  );

  ctx.lineTo(x, y + r);

  ctx.quadraticCurveTo(
    x,
    y,
    x + r,
    y
  );

  ctx.closePath();
}

function drawCard(
  ctx,
  x,
  y,
  w,
  h,
  r = 15,
  bg = 'rgba(30,30,50,0.95)',
  border = null
) {
  ctx.save();

  drawRoundedRect(ctx, x, y, w, h, r);

  ctx.fillStyle = bg;
  ctx.fill();

  if (border) {
    ctx.strokeStyle = border;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  ctx.restore();
}

function drawGradientBg(ctx, w, h) {
  const gradient = ctx.createLinearGradient(
    0,
    0,
    w,
    h
  );

  gradient.addColorStop(0, '#080b14');
  gradient.addColorStop(0.5, '#101a2b');
  gradient.addColorStop(1, '#080b14');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
}

function drawStars(ctx, w, h, count = 40) {
  ctx.save();

  for (let i = 0; i < count; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const radius = Math.random() * 1.3 + 0.2;

    ctx.beginPath();
    ctx.arc(
      x,
      y,
      radius,
      0,
      Math.PI * 2
    );

    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.5 + 0.15})`;
    ctx.fill();
  }

  ctx.restore();
}

function drawProgressBar(
  ctx,
  x,
  y,
  w,
  h,
  progress,
  color = '#4a9eff'
) {
  progress = Math.max(
    0,
    Math.min(100, Number(progress) || 0)
  );

  drawRoundedRect(
    ctx,
    x,
    y,
    w,
    h,
    h / 2
  );

  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fill();

  if (progress <= 0) return;

  const fillW = Math.max(
    h,
    (w * progress) / 100
  );

  drawRoundedRect(
    ctx,
    x,
    y,
    fillW,
    h,
    h / 2
  );

  ctx.fillStyle = color;
  ctx.fill();
}

// ===============================
// تنسيق الأرقام
// ===============================

function ar(value) {
  if (
    value === undefined ||
    value === null ||
    Number.isNaN(Number(value))
  ) {
    return '0';
  }

  const num = Number(value);

  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(2)}B`;
  }

  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(2)}M`;
  }

  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }

  return num.toLocaleString('en-US');
}

// ===============================
// الرتب
// ===============================

function getRankColor(total) {
  total = Number(total) || 0;

  if (total < 1000) return '#808080';
  if (total < 10000) return '#aaaaaa';
  if (total < 50000) return '#4a9eff';
  if (total < 200000) return '#44cc44';
  if (total < 1000000) return '#ffaa00';
  if (total < 10000000) return '#ffd700';
  if (total < 100000000) return '#ff6600';

  return '#ff0066';
}

function getRankName(total) {
  total = Number(total) || 0;

  if (total < 1000) return 'مفلس';
  if (total < 10000) return 'مواطن';
  if (total < 50000) return 'عامل';
  if (total < 200000) return 'تاجر';
  if (total < 1000000) return 'رجل أعمال';
  if (total < 10000000) return 'مليونير';
  if (total < 100000000) return 'ملياردير';

  return 'أسطورة اقتصادية';
}

// ===============================
// إنشاء صورة عامة
// ===============================

function createBaseCanvas(w, h) {
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext('2d');

  drawGradientBg(ctx, w, h);
  drawStars(ctx, w, h);

  return {
    canvas,
    ctx
  };
}

function safeText(ctx, text, x, y, options = {}) {
  try {
    ctx.font =
      options.font ||
      `16px "${FONT}"`;

    ctx.fillStyle =
      options.color ||
      '#ffffff';

    ctx.textAlign =
      options.align ||
      'center';

    ctx.textBaseline = 'alphabetic';

    ctx.fillText(
      String(text ?? ''),
      x,
      y
    );
  } catch (error) {
    console.error(
      '❌ خطأ في رسم النص:',
      error.message
    );
  }
}

// ===============================
// الرصيد
// ===============================

async function generateBalanceImage(user) {
  const w = 700;
  const h = 380;

  const { canvas, ctx } =
    createBaseCanvas(w, h);

  const cash = Number(user.cash) || 0;
  const bank = Number(user.bank) || 0;

  const total = cash + bank;
  const rankColor = getRankColor(total);

  drawCard(
    ctx,
    20,
    20,
    w - 40,
    65,
    15,
    'rgba(255,255,255,0.04)',
    `${rankColor}66`
  );

  safeText(
    ctx,
    `رصيد ${user.username || 'العضو'}`,
    w / 2,
    52,
    {
      font: `bold 25px "${FONT}"`,
      color: rankColor
    }
  );

  safeText(
    ctx,
    `الرتبة: ${getRankName(total)}`,
    w / 2,
    75,
    {
      font: `14px "${FONT}"`,
      color: '#aaaaaa'
    }
  );

  const cardW = 300;
  const cardH = 115;
  const gap = 20;

  const x1 =
    (w - cardW * 2 - gap) / 2;

  const x2 =
    x1 + cardW + gap;

  drawCard(
    ctx,
    x1,
    105,
    cardW,
    cardH,
    15,
    'rgba(30,70,130,0.65)',
    '#2868cc'
  );

  safeText(
    ctx,
    'النقد',
    x1 + cardW / 2,
    135,
    {
      font: `bold 15px "${FONT}"`,
      color: '#7aadff'
    }
  );

  safeText(
    ctx,
    ar(cash),
    x1 + cardW / 2,
    178,
    {
      font: `bold 32px "${FONT}"`,
      color: '#ffffff'
    }
  );

  safeText(
    ctx,
    'عملة',
    x1 + cardW / 2,
    201,
    {
      font: `12px "${FONT}"`,
      color: '#77aadd'
    }
  );

  drawCard(
    ctx,
    x2,
    105,
    cardW,
    cardH,
    15,
    'rgba(30,100,65,0.65)',
    '#258a55'
  );

  safeText(
    ctx,
    'البنك',
    x2 + cardW / 2,
    135,
    {
      font: `bold 15px "${FONT}"`,
      color: '#7affaa'
    }
  );

  safeText(
    ctx,
    ar(bank),
    x2 + cardW / 2,
    178,
    {
      font: `bold 32px "${FONT}"`,
      color: '#ffffff'
    }
  );

  safeText(
    ctx,
    'عملة',
    x2 + cardW / 2,
    201,
    {
      font: `12px "${FONT}"`,
      color: '#55cc88'
    }
  );

  drawCard(
    ctx,
    30,
    240,
    w - 60,
    55,
    12,
    'rgba(255,215,0,0.06)',
    'rgba(255,215,0,0.25)'
  );

  safeText(
    ctx,
    `ذهب: ${ar(user.gold)}`,
    160,
    274,
    {
      font: `14px "${FONT}"`,
      color: '#ffd700'
    }
  );

  safeText(
    ctx,
    `إجمالي: ${ar(total)}`,
    w / 2,
    274,
    {
      font: `bold 14px "${FONT}"`,
      color: '#ffffff'
    }
  );

  safeText(
    ctx,
    `جواهر: ${ar(user.gems)}`,
    w - 160,
    274,
    {
      font: `14px "${FONT}"`,
      color: '#88aaff'
    }
  );

  const xp = Number(user.xp) || 0;
  const level =
    Math.floor(Math.sqrt(xp / 100)) + 1;

  const currentXp =
    Math.pow(level - 1, 2) * 100;

  const nextXp =
    Math.pow(level, 2) * 100;

  let progress = 0;

  if (nextXp > currentXp) {
    progress =
      ((xp - currentXp) /
        (nextXp - currentXp)) *
      100;
  }

  safeText(
    ctx,
    `المستوى ${level}`,
    70,
    325,
    {
      font: `13px "${FONT}"`,
      color: '#aaaaaa',
      align: 'left'
    }
  );

  safeText(
    ctx,
    `${xp} / ${nextXp} XP`,
    w - 70,
    325,
    {
      font: `13px "${FONT}"`,
      color: '#aaaaaa',
      align: 'right'
    }
  );

  drawProgressBar(
    ctx,
    70,
    335,
    w - 140,
    10,
    progress,
    rankColor
  );

  safeText(
    ctx,
    'بوت البنك',
    w / 2,
    368,
    {
      font: `11px "${FONT}"`,
      color: '#555555'
    }
  );

  return canvas.toBuffer('image/png');
}

// ===============================
// صورة بسيطة
// ===============================

async function generateSimpleImage(
  title,
  lines = [],
  color = '#4a9eff',
  emoji = '💰'
) {
  const w = 600;

  const h = Math.max(
    220,
    120 + lines.length * 40
  );

  const { canvas, ctx } =
    createBaseCanvas(w, h);

  drawCard(
    ctx,
    20,
    20,
    w - 40,
    65,
    15,
    `${color}22`,
    `${color}66`
  );

  safeText(
    ctx,
    `${emoji} ${title}`,
    w / 2,
    60,
    {
      font: `bold 23px "${FONT}"`,
      color
    }
  );

  lines.forEach((line, index) => {
    const y = 115 + index * 40;

    if (!line) return;

    if (line.divider) {
      ctx.beginPath();

      ctx.moveTo(40, y);
      ctx.lineTo(w - 40, y);

      ctx.strokeStyle =
        'rgba(255,255,255,0.12)';

      ctx.lineWidth = 1;
      ctx.stroke();

      return;
    }

    if (
      line.left !== undefined &&
      line.right !== undefined
    ) {
      safeText(
        ctx,
        line.left,
        45,
        y,
        {
          font: `15px "${FONT}"`,
          color:
            line.highlight
              ? '#ffd700'
              : '#cccccc',
          align: 'left'
        }
      );

      safeText(
        ctx,
        line.right,
        w - 45,
        y,
        {
          font: `bold 15px "${FONT}"`,
          color:
            line.rightColor ||
            '#ffffff',
          align: 'right'
        }
      );
    } else {
      safeText(
        ctx,
        line.text || String(line),
        w / 2,
        y,
        {
          font: `15px "${FONT}"`,
          color:
            line.highlight
              ? '#ffd700'
              : '#cccccc'
        }
      );
    }
  });

  safeText(
    ctx,
    'بوت البنك',
    w / 2,
    h - 12,
    {
      font: `11px "${FONT}"`,
      color: '#555555'
    }
  );

  return canvas.toBuffer('image/png');
}

// ===============================
// التوب
// ===============================

async function generateLeaderboardImage(
  users = [],
  title = 'أغنى اللاعبين'
) {
  const w = 700;

  const h = Math.max(
    300,
    100 + users.length * 68
  );

  const { canvas, ctx } =
    createBaseCanvas(w, h);

  safeText(
    ctx,
    title,
    w / 2,
    50,
    {
      font: `bold 26px "${FONT}"`,
      color: '#ffd700'
    }
  );

  users.forEach((user, index) => {
    const y = 70 + index * 68;

    const total =
      (Number(user.cash) || 0) +
      (Number(user.bank) || 0);

    const medal =
      index === 0
        ? '🥇'
        : index === 1
          ? '🥈'
          : index === 2
            ? '🥉'
            : `#${index + 1}`;

    drawCard(
      ctx,
      25,
      y,
      w - 50,
      55,
      12,
      'rgba(255,255,255,0.05)',
      index < 3
        ? getRankColor(total)
        : 'rgba(255,255,255,0.1)'
    );

    safeText(
      ctx,
      medal,
      55,
      y + 35,
      {
        font: `bold 20px "${FONT}"`,
        color: '#ffffff',
        align: 'left'
      }
    );

    safeText(
      ctx,
      user.username || 'عضو',
      100,
      y + 25,
      {
        font: `bold 15px "${FONT}"`,
        color: '#ffffff',
        align: 'left'
      }
    );

    safeText(
      ctx,
      getRankName(total),
      100,
      y + 45,
      {
        font: `12px "${FONT}"`,
        color: getRankColor(total),
        align: 'left'
      }
    );

    safeText(
      ctx,
      `${ar(total)} 💰`,
      w - 45,
      y + 34,
      {
        font: `bold 17px "${FONT}"`,
        color: '#ffd700',
        align: 'right'
      }
    );
  });

  safeText(
    ctx,
    'بوت البنك',
    w / 2,
    h - 10,
    {
      font: `11px "${FONT}"`,
      color: '#555555'
    }
  );

  return canvas.toBuffer('image/png');
}

// ===============================
// نتيجة الألعاب
// ===============================

async function generateGameResultImage(
  title,
  result,
  amount,
  isWin,
  details = []
) {
  const w = 600;
  const h = 320;

  const { canvas, ctx } =
    createBaseCanvas(w, h);

  const color =
    isWin
      ? '#44ff88'
      : '#ff4444';

  drawCard(
    ctx,
    20,
    20,
    w - 40,
    70,
    15,
    `${color}22`,
    `${color}66`
  );

  safeText(
    ctx,
    title,
    w / 2,
    62,
    {
      font: `bold 25px "${FONT}"`,
      color
    }
  );

  safeText(
    ctx,
    isWin
      ? `+${ar(amount)}`
      : `-${ar(amount)}`,
    w / 2,
    150,
    {
      font: `bold 42px "${FONT}"`,
      color: isWin
        ? '#ffd700'
        : '#ff6666'
    }
  );

  safeText(
    ctx,
    'عملة',
    w / 2,
    180,
    {
      font: `17px "${FONT}"`,
      color: '#888888'
    }
  );

  safeText(
    ctx,
    result,
    w / 2,
    215,
    {
      font: `bold 19px "${FONT}"`,
      color: '#ffffff'
    }
  );

  details.forEach((detail, index) => {
    safeText(
      ctx,
      detail,
      w / 2,
      245 + index * 22,
      {
        font: `13px "${FONT}"`,
        color: '#aaaaaa'
      }
    );
  });

  safeText(
    ctx,
    'بوت البنك',
    w / 2,
    h - 12,
    {
      font: `11px "${FONT}"`,
      color: '#555555'
    }
  );

  return canvas.toBuffer('image/png');
}

// ===============================
// البروفايل
// ===============================

async function generateProfileImage(
  user,
  properties = [],
  pets = []
) {
  const w = 700;
  const h = 460;

  const { canvas, ctx } =
    createBaseCanvas(w, h);

  const cash = Number(user.cash) || 0;
  const bank = Number(user.bank) || 0;

  const total = cash + bank;
  const rankColor = getRankColor(total);

  drawCard(
    ctx,
    25,
    20,
    w - 50,
    80,
    15,
    `${rankColor}18`,
    `${rankColor}55`
  );

  safeText(
    ctx,
    user.username || 'عضو',
    120,
    55,
    {
      font: `bold 23px "${FONT}"`,
      color: '#ffffff',
      align: 'left'
    }
  );

  safeText(
    ctx,
    `${getRankName(total)} • مستوى ${user.level || 1}`,
    120,
    78,
    {
      font: `14px "${FONT}"`,
      color: rankColor,
      align: 'left'
    }
  );

  safeText(
    ctx,
    `الوظيفة: ${user.job || 'بدون وظيفة'}`,
    120,
    96,
    {
      font: `12px "${FONT}"`,
      color: '#888888',
      align: 'left'
    }
  );

  drawCard(
    ctx,
    25,
    120,
    315,
    100,
    12,
    'rgba(30,70,130,0.55)',
    '#2868cc55'
  );

  safeText(
    ctx,
    'الثروة',
    182,
    148,
    {
      font: `bold 14px "${FONT}"`,
      color: '#7aadff'
    }
  );

  safeText(
    ctx,
    ar(total),
    182,
    185,
    {
      font: `bold 27px "${FONT}"`,
      color: '#ffffff'
    }
  );

  safeText(
    ctx,
    `نقد: ${ar(cash)} | بنك: ${ar(bank)}`,
    182,
    207,
    {
      font: `12px "${FONT}"`,
      color: '#aaaaaa'
    }
  );

  drawCard(
    ctx,
    360,
    120,
    315,
    100,
    12,
    'rgba(80,40,20,0.55)',
    '#aa662255'
  );

  safeText(
    ctx,
    'الخبرة',
    517,
    148,
    {
      font: `bold 14px "${FONT}"`,
      color: '#ffaa7a'
    }
  );

  safeText(
    ctx,
    `${user.xp || 0} XP`,
    517,
    185,
    {
      font: `bold 27px "${FONT}"`,
      color: '#ffffff'
    }
  );

  safeText(
    ctx,
    `المستوى: ${user.level || 1}`,
    517,
    207,
    {
      font: `12px "${FONT}"`,
      color: '#aaaaaa'
    }
  );

  drawCard(
    ctx,
    25,
    240,
    w - 50,
    100,
    12,
    'rgba(255,255,255,0.04)',
    'rgba(255,255,255,0.1)'
  );

  const info = [
    `ذهب: ${ar(user.gold)}`,
    `جواهر: ${ar(user.gems)}`,
    `عقارات: ${properties.length}`,
    `حيوان: ${
      pets.length
        ? pets[0].pet_type
        : 'لا يوجد'
    }`,
    `متزوج: ${
      user.married_to
        ? 'نعم'
        : 'لا'
    }`,
    `نقابة: ${
      user.guild_name || 'لا يوجد'
    }`
  ];

  info.forEach((text, index) => {
    const col = index % 3;
    const row = Math.floor(index / 3);

    safeText(
      ctx,
      text,
      135 + col * 215,
      275 + row * 40,
      {
        font: `13px "${FONT}"`,
        color: '#dddddd'
      }
    );
  });

  safeText(
    ctx,
    `الرتبة: ${getRankName(total)}`,
    w / 2,
    380,
    {
      font: `bold 16px "${FONT}"`,
      color: rankColor
    }
  );

  if (user.married_to) {
    safeText(
      ctx,
      `متزوج من: ${user.married_to}`,
      w / 2,
      410,
      {
        font: `14px "${FONT}"`,
        color: '#ff88bb'
      }
    );
  }

  safeText(
    ctx,
    'بوت البنك',
    w / 2,
    h - 10,
    {
      font: `11px "${FONT}"`,
      color: '#555555'
    }
  );

  return canvas.toBuffer('image/png');
}

// ===============================
// المتجر
// ===============================

async function generateShopImage(items = []) {
  const w = 700;

  const rows =
    Math.ceil(items.length / 2);

  const h = Math.max(
    300,
    100 + rows * 90
  );

  const { canvas, ctx } =
    createBaseCanvas(w, h);

  safeText(
    ctx,
    'المتجر',
    w / 2,
    50,
    {
      font: `bold 26px "${FONT}"`,
      color: '#ffd700'
    }
  );

  items.forEach((item, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);

    const x =
      col === 0
        ? 20
        : 360;

    const y =
      70 + row * 90;

    drawCard(
      ctx,
      x,
      y,
      320,
      75,
      12,
      'rgba(30,30,60,0.75)',
      'rgba(100,100,200,0.3)'
    );

    safeText(
      ctx,
      `${item.emoji || ''} ${item.name || 'غرض'}`,
      x + 15,
      y + 28,
      {
        font: `bold 15px "${FONT}"`,
        color: '#ffffff',
        align: 'left'
      }
    );

    safeText(
      ctx,
      item.description || '',
      x + 15,
      y + 50,
      {
        font: `11px "${FONT}"`,
        color: '#888888',
        align: 'left'
      }
    );

    safeText(
      ctx,
      `${ar(item.price)} 💰`,
      x + 305,
      y + 28,
      {
        font: `bold 15px "${FONT}"`,
        color: '#ffd700',
        align: 'right'
      }
    );
  });

  return canvas.toBuffer('image/png');
}

// ===============================
// الأسهم
// ===============================

async function generateStocksImage(stocks = []) {
  const w = 700;

  const h = Math.max(
    300,
    100 + stocks.length * 65
  );

  const { canvas, ctx } =
    createBaseCanvas(w, h);

  safeText(
    ctx,
    'سوق الأسهم',
    w / 2,
    48,
    {
      font: `bold 25px "${FONT}"`,
      color: '#44ff88'
    }
  );

  stocks.forEach((stock, index) => {
    const y = 65 + index * 65;

    const change =
      Number(stock.change) || 0;

    const up = change >= 0;

    drawCard(
      ctx,
      20,
      y,
      w - 40,
      52,
      10,
      up
        ? 'rgba(20,70,30,0.55)'
        : 'rgba(70,20,20,0.55)',
      up
        ? '#44ff8844'
        : '#ff444444'
    );

    safeText(
      ctx,
      `[${stock.symbol}] ${stock.name || ''}`,
      40,
      y + 22,
      {
        font: `bold 15px "${FONT}"`,
        color: '#ffffff',
        align: 'left'
      }
    );

    safeText(
      ctx,
      `${ar(stock.price)} 💰`,
      w - 40,
      y + 22,
      {
        font: `bold 18px "${FONT}"`,
        color: '#ffd700',
        align: 'right'
      }
    );

    safeText(
      ctx,
      `${up ? '▲' : '▼'} ${Math.abs(change)}%`,
      w - 40,
      y + 42,
      {
        font: `bold 13px "${FONT}"`,
        color: up
          ? '#44ff88'
          : '#ff4444',
        align: 'right'
      }
    );
  });

  safeText(
    ctx,
    'الأسعار تتحدث كل 10 دقائق',
    w / 2,
    h - 10,
    {
      font: `11px "${FONT}"`,
      color: '#555555'
    }
  );

  return canvas.toBuffer('image/png');
}

// ===============================
// التصدير
// ===============================

module.exports = {
  generateBalanceImage,
  generateLeaderboardImage,
  generateSimpleImage,
  generateGameResultImage,
  generateProfileImage,
  generateShopImage,
  generateStocksImage,
  ar
};
