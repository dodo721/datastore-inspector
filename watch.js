const { spawn, execSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const extconfig = require("./extension.config.js");

/**
 * Run a long living command and feed output through to current terminal, with an optional tag
 * @param {*} command 
 * @param {*} tag 
 */
const runProcess = (command, tag="") => {
    
    let cmds = command.replace(/ *$/g, "").replace(/  /g, " ").split(" ");
    let child = spawn(cmds[0], cmds.splice(1, cmds.length - 1), {detached:false, stdio:'pipe'});
    
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', function(data) {
        console.log(tag, data);
    });

    child.stderr.setEncoding('utf8');
    child.stderr.on('data', function(data) {
        console.error(tag, data);
    });

    child.on('close', function(code) {
        console.log(tag, 'Exited with code: ' + code);
    });

};

const beginWatch = () => {

    let prod = false;
    let options = {
        "target":"",
        "binary":"",
        "profile":""
    }
    // valid targets for browser extensions
    let targets = Object.keys(extconfig);

    // command line arguments first
    process.argv.forEach(function (val, index, array) {
        if (val === "--prod" || val === "prod") prod = true;
        // use generic matching to override options
        const varRegex = /--(.+)=(.+)/g;
        const varMatch = [...val.matchAll(varRegex)][0];
        if (varMatch) {
            const name = varMatch[1];
            const val2 = varMatch[2];
            if (!Object.keys(options).includes(name)) {
                console.warn("Unrecognized option: ", name);
                return;
            }
            options[name] = val2;
        }
    });

    // Fill in more values from host config (command line arguments take priority)
    const configFile = './config/' + os.hostname() + '.js';
    let hostConfig = {};
    if (fs.existsSync(configFile)) {
        hostConfig = require(configFile);
    }
    if (hostConfig.BrowserTarget) {
        if (!options.target || options.target === "") options.target = hostConfig.BrowserTarget;
    }
    // target should be filled in from either command line or config - check it's valid
    if (!targets.includes(options.target)) {
        console.error("Invalid browser target:",options.target,"\nTarget must be one of "+targets);
        return;
    }
    if (hostConfig.BrowserProperties) {
        if (!options.binary) options.binary = hostConfig.BrowserProperties[options.target].binary;
        if (!options.profile) options.profile = hostConfig.BrowserProperties[options.target].profile;
    }

    console.log("Beginning compile-watch launch with options ",options);
    
    let webExtTarget = options.target === "chromium" ? "--target=chromium" : "";
    let webExtBinary = options.binary ? (options.target === "chromium" ? `--chromium-binary="${options.binary}"` : `--firefox="${options.binary}"`) : "";
    let webExtProfile = options.profile ? (options.target === "chromium" ? `--chromium-profile="${options.profile}"` : `--firefox-profile="${options.profile}"`) : "";
    let webExtArgs = [webExtTarget,webExtBinary,webExtProfile].join(" ");

    let commands = [
        [`npm run ${prod ? "compile-watch" : "compile-watch-fast"}`, ""],
        [`web-ext run --devtools --sourceDir=extension-${options.target} ${webExtArgs}`, "[web-ext]"],
    ];

    commands.forEach(info => {
        console.log("Running ", info[0]);
        const child = runProcess(info[0], info[1]);
    });
}

beginWatch();