import clock from "clock";
import { preferences } from 'user-settings';
import { display } from 'display';
import { HeartRateSensor } from 'heart-rate';
import { battery } from 'power';
import { today } from 'user-activity';
import document from "document";

// バッテリーや日時など毎秒更新しない処理のインターバル(ms)
const $interval = 60000

/*
   特定桁数の数値を取得する共通処理
   num 数値
   place n桁目
   isNullPossibile ゼロサプレスされうる場合にはtrue
//*/
function getNumberOfPlace(num, place, isNullPossible) {
  if (num == 0 && place > 1 && isNullPossible) {
    // 数字を持たない場合、消灯した状態を返却する
    return 99;
  }

  switch (place) {
    case 1: return num % 10;
    case 2: return Math.floor(num / 10) % 10;
    case 3: return Math.floor(num / 100) % 10;
    case 4: return Math.floor(num / 1000) % 10;
    case 5: return Math.floor(num / 10000) % 10;
    case 6: return Math.floor(num / 100000) % 10;
  }
  // 処理にかすらない場合、全OFFの7segとする
  return 99;
}

/*
  歩数とバッテリー残量の数値取得処理（ちょっと例外なので）
  桁数と数値を与えることで、その数値のその桁にある数字を返却する
  isNullPossibleは絶対にゼロサプレスするならfalseとする
//*/
function getCountableNumberOfPlace(num, place, isNullPossible) {
  if (place > 1 && isNullPossible) {
    // 数字を持たない場合、消灯した状態を返却する
    return 99;
  }

  switch (place) {
    case 1: return num % 10;
    case 2: return Math.floor(num / 10) % 10;
    case 3: return Math.floor(num / 100) % 10;
    case 4: return Math.floor(num / 1000) % 10;
    case 5: return Math.floor(num / 10000) % 10;
    case 6: return Math.floor(num / 100000) % 10;
  }
  // 処理にかすらない場合、全OFFの7segとする
  // 百万歩以上は歩かないと信じてる...
  return 99;
}

// カレンダー処理で必要な定数定義
const dayNum1 = document.getElementById('dayNum1');
const dayNum2 = document.getElementById('dayNum2');
const monthNum1 = document.getElementById('monthNum1');
const monthNum2 = document.getElementById('monthNum2');
const yearNum1 = document.getElementById('yearNum1');
const yearNum2 = document.getElementById('yearNum2');
const yearNum3 = document.getElementById('yearNum3');
const yearNum4 = document.getElementById('yearNum4');
const dayString = document.getElementById('dayString');

/*
   カレンダーの更新処理
   曜日については日曜を0、土曜日を6として取得する
//*/
function updateCalender(date) {
  const year = date.getFullYear();
  // yyyyMMddとなるように0含めて値を与える
  dayNum1.image = `7seg/num_${getNumberOfPlace(date.getDate(), 1, false)}.png`;
  dayNum2.image = `7seg/num_${getNumberOfPlace(date.getDate(), 2, true)}.png`;
  // JavaScriptなのでmonthは+1する
  monthNum1.image = `7seg/num_${getNumberOfPlace((date.getMonth() + 1), 1, false)}.png`;
  monthNum2.image = `7seg/num_${getNumberOfPlace((date.getMonth() + 1), 2, true)}.png`;
  yearNum1.image = `7seg/num_${getNumberOfPlace(year, 1, false)}.png`;
  yearNum2.image = `7seg/num_${getNumberOfPlace(year, 2, false)}.png`;
  yearNum3.image = `7seg/num_${getNumberOfPlace(year, 3, false)}.png`;
  yearNum4.image = `7seg/num_${getNumberOfPlace(year, 4, false)}.png`;

  // 曜日を取得
  dayString.image = `7seg/day_${getNumberOfPlace(date.getDay(), 1, false)}.png`;
}

// 心拍数処理の定数定義
const heartBeatNum1 = document.getElementById('heartBeatNum1');
const heartBeatNum2 = document.getElementById('heartBeatNum2');
const heartBeatNum3 = document.getElementById('heartBeatNum3');
const heartRateSensor = new HeartRateSensor();

/*
  心拍数の取得処理
  心拍数の取得そのものはfitbit APIの力を借りて行う
//*/
heartRateSensor.onreading = () => {
  // 測定していない場合、心拍数0として処理
  const heartRate = (heartRateSensor.heartRate || 0);
  heartBeatNum1.image = `7seg/num_${getNumberOfPlace(heartRate, 1, false)}.png`;
  heartBeatNum2.image = `7seg/num_${getNumberOfPlace(heartRate, 2, true)}.png`;
  // 心拍数3桁以上ならば3桁目の処理を行う。そうでなければゼロサプレス。
  if (heartRate.toString().length >= 3) {
    heartBeatNum3.image = `7seg/num_${getNumberOfPlace(heartRate, 3, true)}.png`;
  }
  else {
    heartBeatNum3.image = `7seg/num_99.png`;
  }
  heartRateSensor.stop();
}

// 心拍数の更新処理
function updateHeartRate() {
  heartRateSensor.start();
}

/*
  歩数処理
  1日100万歩以上はレイアウト崩れるので非サポート
//*/
const stepNum1 = document.getElementById('stepNum1');
const stepNum2 = document.getElementById('stepNum2');
const stepNum3 = document.getElementById('stepNum3');
const stepNum4 = document.getElementById('stepNum4');
const stepNum5 = document.getElementById('stepNum5');
const stepNum6 = document.getElementById('stepNum6');

function updateStep() {
  // user-activityから今日の歩数を取得する
  let step = today.adjusted["steps"];

  // 桁数に応じて0サプレスの範囲を指定する
  let stepDigits = step.toString().length;

  // 0歩の場合は0表示が必要
  stepNum1.image = `7seg/num_${getNumberOfPlace(step, 1, false)}.png`;

  // ゼロサプレス処理が少し特殊なため別処理でチェック
  stepNum2.image = `7seg/num_${getCountableNumberOfPlace(step, 2, (stepDigits < 2))}.png`;
  stepNum3.image = `7seg/num_${getCountableNumberOfPlace(step, 3, (stepDigits < 3))}.png`;
  stepNum4.image = `7seg/num_${getCountableNumberOfPlace(step, 4, (stepDigits < 4))}.png`;
  stepNum5.image = `7seg/num_${getCountableNumberOfPlace(step, 5, (stepDigits < 5))}.png`;
  stepNum6.image = `7seg/num_${getCountableNumberOfPlace(step, 6, (stepDigits < 6))}.png`;

}

// バッテリー残量の表示処理
const battery1 = document.getElementById('battery1');
const battery2 = document.getElementById('battery2');
const battery3 = document.getElementById('battery3');
/*
   バッテリー残量を取得する処理
   APIの力を借りて残量を取得し描画処理を行う
//*/
function updateBattery() {
  let { chargeLevel } = battery;
  let batteryDigits = chargeLevel.toString().length;
  battery1.image = `7seg/num_${getCountableNumberOfPlace(chargeLevel, 1, false)}.png`;
  battery2.image = `7seg/num_${getCountableNumberOfPlace(chargeLevel, 2, (batteryDigits < 2))}.png`;
  battery3.image = `7seg/num_${getCountableNumberOfPlace(chargeLevel, 3, (batteryDigits < 3))}.png`;

}

// 時計としての処理
// hh:mm = hourNum1 hourNum2 : minuteNum1 minuteNum2とする
const hourNum1 = document.getElementById('hourNum1');
const hourNum2 = document.getElementById('hourNum2');
const minuteNum1 = document.getElementById('minuteNum1');
const minuteNum2 = document.getElementById('minuteNum2');

/*
   時計としての更新処理を行う
   12h表示はひとまずハードコーディング
//*/
function updateHoursAndMinutes(date) {
  // 時を取得
  let hours = date.getHours();
  // 12時間表記時の場合
  if (preferences.clockDisplay === '12h') {
    hours = hours % 12 || 12;
  }

  let minutes = date.getMinutes();

  // ./7seg以下の7-seg画像を取得する
  hourNum1.image = `7seg/num_${getNumberOfPlace(hours, 1, false)}.png`;
  hourNum2.image = `7seg/num_${getNumberOfPlace(hours, 2, true)}.png`;
  minuteNum1.image = `7seg/num_${getNumberOfPlace(minutes, 1, false)}.png`;
  minuteNum2.image = `7seg/num_${getNumberOfPlace(minutes, 2, false)}.png`;
}


// 秒単位での更新時のみ別処理とし、負荷軽減する
const secondNum1 = document.getElementById('secondNum1');
const secondNum2 = document.getElementById('secondNum2');

/*
   秒の更新処理
   更新頻度が秒単位（時間は2秒に一度）なので別函数として定義
//*/
function updateSeconds(date) {
  const seconds = date.getSeconds();
  secondNum1.image = `7seg/num_${getNumberOfPlace(seconds, 1, false)}.png`;
  secondNum2.image = `7seg/num_${getNumberOfPlace(seconds, 2, false)}.png`;
}


/*
   コロンのちかちか処理
//*/
const colon = document.getElementById('colon');
function changeColon(isColonVisible) {
  colon.image = isColonVisible ? `7seg/colon_1.png` : `7seg/colon_0.png`;
}

// tickの単位時間を定義
clock.granularity = 'seconds';

// 初期ロード時に読み込みするよう処理を追加
let lastUpdateTime = 0;
let isInitialized = false;

// 真ん中のコロンを点灯するためのフラグ
let isColonVisible = true;

/*
  アプリケーションのメイン処理
  毎秒tickイベントを走らせ、必要に応じて更新処理を走らせる
//*/
clock.ontick = evt => {
  const { date } = evt;
  const now = date.getTime();

  updateHoursAndMinutes(date);

  // 初期表示の際にnullになるのを防ぐ処理
  if (!isInitialized) {
    updateBattery();
    updateStep();
    updateCalender(date);
    lastUpdateTime = now;
    updateHeartRate();
    // 初期化したため初期化実施済フラグを変更する
    isInitialized = true;
  }

  // 最終更新時間より$interval経過している場合に毎秒更新不要な処理を実行する
  if (now - lastUpdateTime > $interval || !isInitialized) {
    // updateWeather();
    updateCalender(date);
    lastUpdateTime = now;
    updateHeartRate();
  }

  // ディスプレイ起動時のみ毎秒「秒」と歩数を読み込む
  if (display.on) {
    // 心拍数とかの読み込みはやりすぎるとアレだから2秒に1回ぐらい
    if (date.getSeconds() % 2 == 0) {
      updateHeartRate();
      updateStep();
      updateBattery();
    }

    updateSeconds(date);

    // コロンのちかちかをフラグ入れ替えで実現する
    changeColon(isColonVisible);
    isColonVisible = !isColonVisible;
  }
};


