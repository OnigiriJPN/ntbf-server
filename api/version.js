const fs = require('fs');
const path = require('path');

export default function handler(req, res){
  const filePath = path.join(process.cwd(), 'public', 'version.json')

  if(!fs.existsSync(filePath))
  {
    return res.status(404).json({
      
    })
  }
}
