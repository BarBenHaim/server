const { NodeVM } = require('vm2')

const executeCodeSafely = async code => {
    try {
        const output = []
        const vm = new NodeVM({
            timeout: 1000,
            sandbox: {
                console: {
                    log: (...args) => output.push(args.join(' ')),
                },
            },
            require: {
                external: true,
            },
        })

        const result = vm.run(code, 'sandbox.js')
        if (output.length > 0) {
            return output.join('\n')
        }

        return result !== undefined ? result.toString() : 'undefined'
    } catch (error) {
        return `Error: ${error.message}`
    }
}

module.exports = { executeCodeSafely }
