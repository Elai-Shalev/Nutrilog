const { Readline } = require('readline/promises');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline')

const arr = []
function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

const find_value = async () => {
    
    let i = 0
    while(i < 30){
        
        console.log(arr)
        if (arr.length > 5){
            return Promise.resolve(arr[arr.length - 1])
        }
        else{
            await sleep(500)
        }
        i += 1
    }
}

const getWeight = () => {
    //return Promise.resolve(31);    

    let i = 0
    const port = "\\\\.\\COM10";
    // Create a new serial port instance
    var portInstance = new SerialPort({
        path: port,
        baudRate: 57600,
    });

    const parser = portInstance.pipe(new ReadlineParser({ delimiter: '\n' }));
    portInstance.on('data', (data) => {
        let val = data.toString('ascii').replace(/[\n]/, '').replace(' ', '');
        if (val.length == 5) {
            arr.push(parseFloat(val))
        }
        i++;

        if (i >= 25) {
            // Close the serial port after reading 1000 lines of data
            portInstance.close();
        }
    });

    // Handle serial port errors
    portInstance.on('error', (err) => {
        console.error('Serial port error:', err);
    });
    
};
  

module.exports.getWeight = getWeight;
module.exports.find_value = find_value;

