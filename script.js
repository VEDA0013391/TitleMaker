const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const submitButton = document.getElementById('submitButton');
const downloadButton = document.getElementById('downloadButton');
const danToggle = document.getElementById('danToggle');
const danOptions = document.getElementById('danOptions');
const form = document.getElementById('inputForm');

const CANVAS_WIDTH = 556;
const CANVAS_HEIGHT = 140;
const TITLE_MAX_FONT = 25;
const TITLE_MIN_FONT = 14;
const TITLE_MAX_WIDTH = 440;
const PLAYER_NAME_FONT = 25;

const FONT_DATAS = [
    ["FOT", "./fonts/fot.otf"],
    ["GW", "./fonts/GW.ttf"],
    ["Korea", "./fonts/Korea.otf"],
    ["Russia", "./fonts/EBG.ttf"]
];

let isImageDrawn = false;
let isFontLoaded = false;

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// フォントの読み込み
Promise.all(
    FONT_DATAS.map(([name, path]) => 
        new FontFace(name, `url(${path})`).load().then(f => document.fonts.add(f))
    )
).then(() => {
    isFontLoaded = true;
    submitButton.disabled = false;
    console.log("Fonts loaded");
}).catch(err => {
    console.error("Font loading failed:", err);
});

danToggle.addEventListener('change', () => {
    danOptions.style.display = danToggle.checked ? 'block' : 'none';
});

form.addEventListener('submit', e => {
    e.preventDefault();
    if (!isFontLoaded) return alert('フォント読込中です。少々お待ちください');
    drawPlate();
});

downloadButton.addEventListener('click', handleDownload);

function drawPlate() {
    const title = document.getElementById('title').value.trim();
    const name = document.getElementById('name').value.trim();
    const type = document.getElementById('type').value;
    const showDan = danToggle.checked;

    const isNonePlate = type.startsWith("none-");

    if (!name) {
        return alert("プレイヤー名を入力してください");
    }

    if (!isNonePlate && !title) {
        return alert("称号名を入力してください");
    }

    const platePath = showDan
        ? `./images/plate/dan/${type}.png`
        : `./images/plate/no-dan/${type}.png`;

    const plateImage = new Image();

    plateImage.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(plateImage, 0, CANVAS_HEIGHT - plateImage.height, CANVAS_WIDTH, plateImage.height);

        if (title) {
            drawTitle(title);
        }

        drawPlayerName(name, showDan);

        if (showDan) {
            drawDanImage();
        } else {
            enableDownload();
        }
    };

    plateImage.onerror = () =>
        handleError('プレート画像の読み込みに失敗しました。\ntwitterで@ryo_001339のDMに連絡お願いします');
    plateImage.src = platePath;
}

function drawTitle(title) {
    let fontSize = TITLE_MAX_FONT;
    const fontStack = getFontStack();
    
    ctx.font = `${fontSize}px ${fontStack}`;
    
    while (ctx.measureText(title).width > TITLE_MAX_WIDTH && fontSize > TITLE_MIN_FONT) {
        fontSize--;
        ctx.font = `${fontSize}px ${fontStack}`;
    }

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#000";
    ctx.fillText(title, CANVAS_WIDTH / 2, 72); 
}

function drawPlayerName(name, showDan) {
    const fontStack = getFontStack();
    ctx.font = `${PLAYER_NAME_FONT}px ${fontStack}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#000';
    ctx.fillStyle = '#fff';
    ctx.miterLimit = 1;

    const textWidth = ctx.measureText(name).width;
    const y = 114.5; 
    let x = showDan ? CANVAS_WIDTH * 0.26 : CANVAS_WIDTH / 2;

    if (showDan) {
        const maxWidth = CANVAS_WIDTH / 2 - 20;
        if (textWidth > maxWidth) x -= (textWidth - maxWidth) / 2;
    }

    ctx.strokeText(name, x, y);
    ctx.fillText(name, x, y);
}

function drawDanImage() {
    const danLevel = document.getElementById('danLevel').value;
    const frameColor = document.getElementById('frameColor').value;
    const passColor = document.getElementById('passColor').value;
    
    const danImage = new Image();
    danImage.onload = () => {
        const scale = 0.85;
        const w = danImage.width * scale;
        const h = danImage.height * scale;
        const x = CANVAS_WIDTH - w - 100;
        // CANVAS_HEIGHTを基準に計算しているため、自動的に以前より下がります
        const y = CANVAS_HEIGHT - h - 7.5;
        ctx.drawImage(danImage, x, y, w, h);
        enableDownload();
    };
    danImage.onerror = () => handleError('この段位表示は素材がありません。');
    danImage.src = `./images/dan-i/${danLevel}-${frameColor}${passColor}.png`;
}

function getFontStack() {
    return FONT_DATAS.map(([name]) => `'${name}'`).join(', ');
}

function enableDownload() {
    isImageDrawn = true;
    downloadButton.disabled = false;
}

function handleError(msg) {
    alert(msg);
    isImageDrawn = false;
    downloadButton.disabled = true;
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function handleDownload() {
    if (!isImageDrawn) return alert('称号が生成されていません');
    const link = document.createElement('a');
    link.download = 'nameplate.png';
    link.href = canvas.toDataURL();
    link.click();
}