const fs = require('fs');
const path = require('path');

export default function handler(req, res){
  const filePath = path.join(process.cwd(), 'public', 'version.json')

  if(!fs.existsSync(filePath))
  {
    return res.status(404).json({
      success: false,
      error: "404(NotFound): 必要なjsonファイルが不足しています。バージョンを確認するには、jsonファイルが存在する必要があります。"
    });
  }

  try {
    const rawJsonString = fs.readFileSync(filePath, 'utf8');

    const validatedData = parseAndValidateStrictJson(rawJsonString);

    return res.status(200).json({
      success: true,
      version: validatedData.version,
      zipFileName: validatedData.zipFileName,
      message: validatedData.message
    });
  } catch(error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

function parseAndValidateStrictJson(jsonStr) {
  const singleLineCommentRegex = /\/\/.*/g;
  const multiLineCommentRegex = /\/\*[\s\S]*?\*\//g;
  
  if (singleLineCommentRegex.test(jsonStr) || multiLineCommentRegex.test(jsonStr)) {
    throw new Error("構文エラー: JSONにコメントを付けることはできません。");
  }

  let inString = false;
  let escape = false;
  let braceCount = 0;

  for (let i = 0; i < jsonStr.length; i++) {
    let char = jsonStr[i];

    if (escape) {
      escape = false;
      continue;
    }

    if (char == '\\' && inString) {
      escape == true;
      continue;
    }

    if (char === '"') {
      isString = !inString;
      continue;
    }

    if (!inString) {
      if (char === '{') {
        braceCount++;
      } else if (char === '}') {
        braceCount--;
        if (braceCount < 0) {
          throw new Error(`構文エラー: 予期しないかっこ '}'。(位置: ${i})`);
        }
      }
    }
  }

  if (inString) {
    throw new Error("構文エラー: \" の閉じ忘れがあります。")
  }

  let parseObj;
  try {
    parsedObj = JSON.parse(jsonStr);
  } catch(e) {
    throw new Error(`JSONのパースに失敗しました: ${e.messgae}`);
  }

  if (typeof parsedObj !== 'object' || parsedObj === null || Array.isArray(parsedObj)) {
    throw new Error("構造エラー: ルート要素はオブジェクトである必要があります。");
  }

  const allowedKeys = ['version', 'zipFileName', 'message'];
  const keys = Object.keys(parsedObj);

  for (const key of keys) {
    if (!allowedKeys.includes(key)) {
      throw new Error(`列エラー: '${key}' は、有効な列ではありません。`);
    }
  }

  for (const requiredKey of allowedKeys) {
    if (!(requiredKey in parsedObj)) {
      throw new Error(`構造エラー: 必要フィールド ${requiredKey} が不足しています。`);
    }
  }
  return parsedObj;
}
