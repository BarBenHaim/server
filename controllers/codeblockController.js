const CodeBlock = require('../models/CodeBlock')

const getCodeBlocks = async (req, res) => {
    try {
        const codeBlocks = await CodeBlock.find({})
        res.status(200).json(codeBlocks)
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch code blocks.' })
    }
}

const getCodeBlock = async (req, res) => {
    try {
        const codeBlock = await CodeBlock.findById(req.params.id)
        if (!codeBlock) {
            return res.status(404).json({ error: 'Code block not found.' })
        }
        res.status(200).json(codeBlock)
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch code block.' })
    }
}

module.exports = { getCodeBlocks, getCodeBlock }
