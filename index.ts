import * as fs from 'fs';
import readline from 'readline';
// run netstat -ab to determine taken ports.
// add ss -tulw for liunx ports
// run netstat -a > portScan.txt
// conver output to UTF 8 (PowerShell)
// Get-Content .\portScan.txt | Set-Content -Encoding utf8 portScanUtf8.txt

// TODO - query well known ports to add them to used port list to avoid potential conflicts with future apps

var data = fs.readFileSync('./portScanUtf8.txt', { encoding: "utf-8" });
const logFile = fs.readFileSync('./portLog.log', { encoding: "utf-8" });
var splitByRow = data.split('\n');
const filteredRows = splitByRow.filter(row => row.indexOf('TCP') > -1 || row.indexOf('UDP') > -1)
const portNumbers = filteredRows.flatMap(string => string.split('  ').flatMap(ar => ar.split(':'))).filter(Number).map(el => parseInt(el)).sort((a, b) => a - b);
const uniquePortNumbers = new Set(portNumbers);
const takenPorts = [...uniquePortNumbers];
// console.log(splitByRow);

const testPortRange = (ports: number[], start: number, end: number | null = null): boolean => {
    end = end || start;
    let found = false;

    for (let index = 0; index < end - start + 1; index++) {

        found = ports.indexOf(start + index) > -1;

        if (found) break;


    }
    return found
}
// console.log(testPortRange(takenPorts,41000
//     ,
//     41110));
//     console.log(testPortRange(takenPorts,183

//     ));


const portForwardScriptWindows = (portNumber: number) => {
    if (!testPortRange(takenPorts, portNumber)) {
        let portScript = `netsh interface portproxy add v4tov4 listenport=${portNumber} listenaddress=127.0.0.1 connectport=${portNumber} connectaddress=0.0.0.0`;
        // console.log(portScript);
        fs.writeFile('./portLog.log', portScript + '\n', { flag: "a+" }, (err) => {
            if (err) throw err;
            console.log('The file is created if not existing!!');
        });

    }
    return false;
};

// portForwardScriptWindows(41001);



const analyzePorts = (start: number, end: number | null = null) => {
    end = end || start;
    let freePorts: number[] = [];

    for (let index = 0; index < end - start + 1; index++) {

        if (takenPorts.indexOf(start + index) < 0)
            freePorts.push(start + index);




    }
    return freePorts.join(' port is available \n')
}

// const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('Port map file is required - portScan.txt')
rl.question("enter start port ? ", function (startPort) {
    rl.question("enter end port ? ", function (endPort) {
        // console.log(typeof +startPort);


        console.log(analyzePorts(+startPort, +endPort))
        rl.question('Generate windows script? type port or press enter to exit: \n', (scriptPort) => {
            if (+scriptPort) portForwardScriptWindows(+scriptPort);
            rl.close();
        })

    });
});
