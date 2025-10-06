#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

/**
 * Generate comprehensive test report from coverage data
 */
function generateTestReport() {
  const reportDir = path.join(__dirname, '../test-reports')
  const adminCoveragePath = path.join(__dirname, '../apps/admin/coverage/coverage-summary.json')
  const apiCoveragePath = path.join(__dirname, '../apps/api/coverage/coverage-summary.json')
  
  // Ensure reports directory exists
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true })
  }

  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      coverage: {
        admin: null,
        api: null,
        overall: null
      }
    },
    details: {
      admin: {
        tests: [],
        coverage: null
      },
      api: {
        tests: [],
        coverage: null
      }
    }
  }

  // Read admin coverage
  if (fs.existsSync(adminCoveragePath)) {
    const adminCoverage = JSON.parse(fs.readFileSync(adminCoveragePath, 'utf8'))
    report.details.admin.coverage = adminCoverage.total
    report.summary.coverage.admin = adminCoverage.total
  }

  // Read API coverage
  if (fs.existsSync(apiCoveragePath)) {
    const apiCoverage = JSON.parse(fs.readFileSync(apiCoveragePath, 'utf8'))
    report.details.api.coverage = apiCoverage.total
    report.summary.coverage.api = apiCoverage.total
  }

  // Calculate overall coverage
  if (report.summary.coverage.admin && report.summary.coverage.api) {
    report.summary.coverage.overall = {
      lines: {
        total: report.summary.coverage.admin.lines.total + report.summary.coverage.api.lines.total,
        covered: report.summary.coverage.admin.lines.covered + report.summary.coverage.api.lines.covered,
        pct: (report.summary.coverage.admin.lines.covered + report.summary.coverage.api.lines.covered) / 
             (report.summary.coverage.admin.lines.total + report.summary.coverage.api.lines.total) * 100
      },
      functions: {
        total: report.summary.coverage.admin.functions.total + report.summary.coverage.api.functions.total,
        covered: report.summary.coverage.admin.functions.covered + report.summary.coverage.api.functions.covered,
        pct: (report.summary.coverage.admin.functions.covered + report.summary.coverage.api.functions.covered) / 
             (report.summary.coverage.admin.functions.total + report.summary.coverage.api.functions.total) * 100
      },
      branches: {
        total: report.summary.coverage.admin.branches.total + report.summary.coverage.api.branches.total,
        covered: report.summary.coverage.admin.branches.covered + report.summary.coverage.api.branches.covered,
        pct: (report.summary.coverage.admin.branches.covered + report.summary.coverage.api.branches.covered) / 
             (report.summary.coverage.admin.branches.total + report.summary.coverage.api.branches.total) * 100
      },
      statements: {
        total: report.summary.coverage.admin.statements.total + report.summary.coverage.api.statements.total,
        covered: report.summary.coverage.admin.statements.covered + report.summary.coverage.api.statements.covered,
        pct: (report.summary.coverage.admin.statements.covered + report.summary.coverage.api.statements.covered) / 
             (report.summary.coverage.admin.statements.total + report.summary.coverage.api.statements.total) * 100
      }
    }
  }

  // Generate HTML report
  const htmlReport = generateHtmlReport(report)
  fs.writeFileSync(path.join(reportDir, 'test-report.html'), htmlReport)

  // Generate JSON report
  fs.writeFileSync(path.join(reportDir, 'test-report.json'), JSON.stringify(report, null, 2))

  // Generate markdown report
  const markdownReport = generateMarkdownReport(report)
  fs.writeFileSync(path.join(reportDir, 'test-report.md'), markdownReport)

  console.log('Test report generated successfully!')
  console.log(`HTML Report: ${path.join(reportDir, 'test-report.html')}`)
  console.log(`JSON Report: ${path.join(reportDir, 'test-report.json')}`)
  console.log(`Markdown Report: ${path.join(reportDir, 'test-report.md')}`)
}

function generateHtmlReport(report) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Club Corra Pilot 2 - Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px; }
        .card { border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
        .coverage { background: #e8f5e8; }
        .coverage.low { background: #ffe8e8; }
        .coverage.medium { background: #fff8e8; }
        .coverage.high { background: #e8f5e8; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .metric { font-weight: bold; }
        .percentage { font-size: 1.2em; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Club Corra Pilot 2 - Test Report</h1>
        <p>Generated: ${new Date(report.timestamp).toLocaleString()}</p>
    </div>

    <div class="summary">
        <div class="card">
            <h3>Test Summary</h3>
            <p><strong>Total Tests:</strong> ${report.summary.totalTests}</p>
            <p><strong>Passed:</strong> ${report.summary.passedTests}</p>
            <p><strong>Failed:</strong> ${report.summary.failedTests}</p>
        </div>
        
        ${report.summary.coverage.overall ? `
        <div class="card coverage ${getCoverageClass(report.summary.coverage.overall.lines.pct)}">
            <h3>Overall Coverage</h3>
            <p><strong>Lines:</strong> ${report.summary.coverage.overall.lines.pct.toFixed(1)}%</p>
            <p><strong>Functions:</strong> ${report.summary.coverage.overall.functions.pct.toFixed(1)}%</p>
            <p><strong>Branches:</strong> ${report.summary.coverage.overall.branches.pct.toFixed(1)}%</p>
            <p><strong>Statements:</strong> ${report.summary.coverage.overall.statements.pct.toFixed(1)}%</p>
        </div>
        ` : ''}
        
        ${report.summary.coverage.admin ? `
        <div class="card coverage ${getCoverageClass(report.summary.coverage.admin.lines.pct)}">
            <h3>Admin App Coverage</h3>
            <p><strong>Lines:</strong> ${report.summary.coverage.admin.lines.pct.toFixed(1)}%</p>
            <p><strong>Functions:</strong> ${report.summary.coverage.admin.functions.pct.toFixed(1)}%</p>
            <p><strong>Branches:</strong> ${report.summary.coverage.admin.branches.pct.toFixed(1)}%</p>
            <p><strong>Statements:</strong> ${report.summary.coverage.admin.statements.pct.toFixed(1)}%</p>
        </div>
        ` : ''}
        
        ${report.summary.coverage.api ? `
        <div class="card coverage ${getCoverageClass(report.summary.coverage.api.lines.pct)}">
            <h3>API Coverage</h3>
            <p><strong>Lines:</strong> ${report.summary.coverage.api.lines.pct.toFixed(1)}%</p>
            <p><strong>Functions:</strong> ${report.summary.coverage.api.functions.pct.toFixed(1)}%</p>
            <p><strong>Branches:</strong> ${report.summary.coverage.api.branches.pct.toFixed(1)}%</p>
            <p><strong>Statements:</strong> ${report.summary.coverage.api.statements.pct.toFixed(1)}%</p>
        </div>
        ` : ''}
    </div>

    <div class="card">
        <h3>Coverage Details</h3>
        ${report.summary.coverage.overall ? `
        <table>
            <thead>
                <tr>
                    <th>Metric</th>
                    <th>Covered</th>
                    <th>Total</th>
                    <th>Percentage</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="metric">Lines</td>
                    <td>${report.summary.coverage.overall.lines.covered}</td>
                    <td>${report.summary.coverage.overall.lines.total}</td>
                    <td class="percentage">${report.summary.coverage.overall.lines.pct.toFixed(1)}%</td>
                </tr>
                <tr>
                    <td class="metric">Functions</td>
                    <td>${report.summary.coverage.overall.functions.covered}</td>
                    <td>${report.summary.coverage.overall.functions.total}</td>
                    <td class="percentage">${report.summary.coverage.overall.functions.pct.toFixed(1)}%</td>
                </tr>
                <tr>
                    <td class="metric">Branches</td>
                    <td>${report.summary.coverage.overall.branches.covered}</td>
                    <td>${report.summary.coverage.overall.branches.total}</td>
                    <td class="percentage">${report.summary.coverage.overall.branches.pct.toFixed(1)}%</td>
                </tr>
                <tr>
                    <td class="metric">Statements</td>
                    <td>${report.summary.coverage.overall.statements.covered}</td>
                    <td>${report.summary.coverage.overall.statements.total}</td>
                    <td class="percentage">${report.summary.coverage.overall.statements.pct.toFixed(1)}%</td>
                </tr>
            </tbody>
        </table>
        ` : '<p>No coverage data available</p>'}
    </div>
</body>
</html>
  `
}

function generateMarkdownReport(report) {
  return `# Club Corra Pilot 2 - Test Report

Generated: ${new Date(report.timestamp).toLocaleString()}

## Summary

- **Total Tests:** ${report.summary.totalTests}
- **Passed:** ${report.summary.passedTests}
- **Failed:** ${report.summary.failedTests}

## Coverage Report

${report.summary.coverage.overall ? `
### Overall Coverage
- **Lines:** ${report.summary.coverage.overall.lines.pct.toFixed(1)}% (${report.summary.coverage.overall.lines.covered}/${report.summary.coverage.overall.lines.total})
- **Functions:** ${report.summary.coverage.overall.functions.pct.toFixed(1)}% (${report.summary.coverage.overall.functions.covered}/${report.summary.coverage.overall.functions.total})
- **Branches:** ${report.summary.coverage.overall.branches.pct.toFixed(1)}% (${report.summary.coverage.overall.branches.covered}/${report.summary.coverage.overall.branches.total})
- **Statements:** ${report.summary.coverage.overall.statements.pct.toFixed(1)}% (${report.summary.coverage.overall.statements.covered}/${report.summary.coverage.overall.statements.total})
` : 'No coverage data available'}

${report.summary.coverage.admin ? `
### Admin App Coverage
- **Lines:** ${report.summary.coverage.admin.lines.pct.toFixed(1)}% (${report.summary.coverage.admin.lines.covered}/${report.summary.coverage.admin.lines.total})
- **Functions:** ${report.summary.coverage.admin.functions.pct.toFixed(1)}% (${report.summary.coverage.admin.functions.covered}/${report.summary.coverage.admin.functions.total})
- **Branches:** ${report.summary.coverage.admin.branches.pct.toFixed(1)}% (${report.summary.coverage.admin.branches.covered}/${report.summary.coverage.admin.branches.total})
- **Statements:** ${report.summary.coverage.admin.statements.pct.toFixed(1)}% (${report.summary.coverage.admin.statements.covered}/${report.summary.coverage.admin.statements.total})
` : ''}

${report.summary.coverage.api ? `
### API Coverage
- **Lines:** ${report.summary.coverage.api.lines.pct.toFixed(1)}% (${report.summary.coverage.api.lines.covered}/${report.summary.coverage.api.lines.total})
- **Functions:** ${report.summary.coverage.api.functions.pct.toFixed(1)}% (${report.summary.coverage.api.functions.covered}/${report.summary.coverage.api.functions.total})
- **Branches:** ${report.summary.coverage.api.branches.pct.toFixed(1)}% (${report.summary.coverage.api.branches.covered}/${report.summary.coverage.api.branches.total})
- **Statements:** ${report.summary.coverage.api.statements.pct.toFixed(1)}% (${report.summary.coverage.api.statements.covered}/${report.summary.coverage.api.statements.total})
` : ''}

## Test Commands

\`\`\`bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run specific app tests
npm run test:admin
npm run test:api

# Run specific test types
npm run test:unit
npm run test:integration
npm run test:components
npm run test:hooks
npm run test:controllers
npm run test:services
\`\`\`

## Coverage Thresholds

- **Lines:** 80%
- **Functions:** 80%
- **Branches:** 80%
- **Statements:** 80%

## Notes

This report is generated automatically from Jest coverage data. For detailed coverage information, check the individual coverage reports in each app's coverage directory.
`
}

function getCoverageClass(percentage) {
  if (percentage >= 80) return 'high'
  if (percentage >= 60) return 'medium'
  return 'low'
}

// Run the report generation
generateTestReport()
