const fs = require('fs');
const path = require('path');
const dir = 'c:/Users/XEON/Desktop/carbike-novo/backend/uploads/veiculo';
const files = fs.readdirSync(dir);
const sample = files.find(f => f.includes('1203'));
if (sample) {
    console.log('Filename:', sample);
    console.log('Buffer:', Buffer.from(sample, 'utf8').toString('hex'));
    console.log('Buffer (latin1):', Buffer.from(sample, 'latin1').toString('hex'));
} else {
    console.log('No file found with 1203');
    console.log('First 5 files:', files.slice(0, 5));
}
