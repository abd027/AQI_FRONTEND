/**
 * Fix N/A Display in Live City Ranking Widget
 * Run: node fix_na_display.js
 */

const fs = require('fs');
const path = require('path');

const widgetPath = path.join(__dirname, 'src', 'components', 'dashboard', 'live-city-ranking-widget.tsx');

console.log('Fixing N/A display in live-city-ranking-widget.tsx...\n');

try {
    let content = fs.readFileSync(widgetPath, 'utf8');

    // Fix the N/A display issue
    const oldPattern = /\{city\.aqi_pm25 \?\? 'N\/A'\}/g;
    const newValue = '{primaryAqi}';

    if (content.match(oldPattern)) {
        content = content.replace(oldPattern, newValue);
        fs.writeFileSync(widgetPath, content, 'utf8');
        console.log('✅ Successfully fixed N/A display bug');
        console.log('   Changed: {city.aqi_pm25 ?? \'N/A\'}');
        console.log('   To:      {primaryAqi}');
        console.log('\n⚠ Please refresh your browser to see the changes');
    } else {
        console.log('⚠ Pattern not found - checking if already fixed...');
        if (content.includes('{primaryAqi}') && content.includes('const primaryAqi')) {
            console.log('✓ Fix already applied - file is up to date');
        } else {
            console.log('❌ Unexpected file content - manual fix may be required');
        }
    }
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}
