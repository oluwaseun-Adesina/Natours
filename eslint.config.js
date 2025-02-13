import globals from 'globals'
import pluginJs from '@eslint/js'
import pluginReact from 'eslint-plugin-react'

export default [
    // Global configuration
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                __dirname: 'readonly', // Allow use of __dirname
            },
        },
        env: {
            node: true, // Enable Node.js environment (for globals like __dirname)
        },
        rules: {
            'no-unused-vars': [
                'warn',
                { varsIgnorePattern: 'val|err' }, // Ignore 'val' and 'err' for no-unused-vars rule
            ],
            'no-undef': 'off', // Turn off no-undef for Node.js globals
        },
    },
    // Apply settings for JavaScript and JSX files
    {
        files: ['**/*.{js,mjs,cjs,jsx}'],
        languageOptions: {
            sourceType: 'module',
        },
        rules: {
            // Additional file-specific rules can go here
        },
    },
    // Apply settings for CommonJS JavaScript files
    {
        files: ['**/*.js'],
        languageOptions: {
            sourceType: 'commonjs',
        },
    },
    // Recommended configurations from plugins
    pluginJs.configs.recommended,
    pluginReact.configs.flat.recommended,
]
