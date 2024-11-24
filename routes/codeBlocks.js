const express = require('express')
const { getCodeBlocks, getCodeBlock } = require('../controllers/codeblockController.js')

const router = express.Router()

router.get('/', getCodeBlocks)
router.get('/:id', getCodeBlock)

module.exports = router
