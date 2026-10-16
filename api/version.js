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
}
