/**
 * Google Sheets Investor Data Integration
 * Fetches data from Port St. Lucie investor spreadsheet for real-time analysis
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Your spreadsheet ID from the URL
const SPREADSHEET_ID = '1G4ACS7NJRBcE8XyhU4V2un5xPIm_b90fPi2Rt4iMs4k';
const SHEET_NAME = 'Sheet1'; // Adjust if different

class InvestorDataIntegration {
  constructor() {
    this.auth = null;
    this.sheets = null;
  }

  async initialize() {
    try {
      // Try to load credentials from environment or credentials file
      const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || 
                             path.join(__dirname, '../config/google-credentials.json');
      
      if (!fs.existsSync(credentialsPath)) {
        console.log('⚠️  Google credentials not found. Using public access mode...');
        return this.initializePublicAccess();
      }

      const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
      
      this.auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
      });

      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
      console.log('✅ Google Sheets authentication successful');
      return true;
    } catch (error) {
      console.error('❌ Authentication failed:', error.message);
      return false;
    }
  }

  async initializePublicAccess() {
    // Initialize without auth for public spreadsheets
    this.sheets = google.sheets({ version: 'v4' });
    return true;
  }

  async fetchInvestorData() {
    try {
      console.log('\n📊 Fetching investor data from Google Sheets...');
      console.log(`   Spreadsheet ID: ${SPREADSHEET_ID}`);
      
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A1:Z1000`, // Fetch all data
      });

      const rows = response.data.values;
      
      if (!rows || rows.length === 0) {
        console.log('⚠️  No data found in spreadsheet');
        return { headers: [], data: [] };
      }

      const headers = rows[0];
      const data = rows.slice(1).map(row => {
        const record = {};
        headers.forEach((header, index) => {
          record[header] = row[index] || '';
        });
        return record;
      });

      console.log(`✅ Fetched ${data.length} records from spreadsheet`);
      console.log(`   Columns: ${headers.join(', ')}`);
      
      return { headers, data };
    } catch (error) {
      console.error('❌ Failed to fetch data:', error.message);
      
      if (error.message.includes('permission')) {
        console.log('\n🔐 PERMISSION REQUIRED:');
        console.log('   1. Make sure the spreadsheet is shared with "Anyone with the link can view"');
        console.log('   2. Or provide Google Service Account credentials');
        console.log('   3. Set GOOGLE_APPLICATION_CREDENTIALS environment variable');
      }
      
      return { headers: [], data: [], error: error.message };
    }
  }

  async analyzeInvestorData(data) {
    console.log('\n🔍 Analyzing investor data...');
    
    const analysis = {
      totalRecords: data.length,
      propertyTypes: {},
      priceRanges: {},
      locations: {},
      opportunities: [],
      summary: {}
    };

    data.forEach(record => {
      // Analyze property types
      const propType = record['Property Type'] || record['Type'] || 'Unknown';
      analysis.propertyTypes[propType] = (analysis.propertyTypes[propType] || 0) + 1;

      // Analyze locations
      const location = record['City'] || record['Location'] || record['Address'] || 'Unknown';
      analysis.locations[location] = (analysis.locations[location] || 0) + 1;

      // Analyze price ranges
      const price = parseFloat(record['Price'] || record['Value'] || record['List Price'] || 0);
      if (price > 0) {
        const range = price < 200000 ? '<$200K' :
                     price < 400000 ? '$200K-$400K' :
                     price < 600000 ? '$400K-$600K' : '>$600K';
        analysis.priceRanges[range] = (analysis.priceRanges[range] || 0) + 1;
      }

      // Identify high-opportunity properties
      const distressScore = parseFloat(record['Distress Score'] || record['Opportunity Score'] || 0);
      const status = record['Status'] || record['Property Status'] || '';
      
      if (distressScore > 70 || status.toLowerCase().includes('distress') || 
          status.toLowerCase().includes('foreclosure') || status.toLowerCase().includes('motivated')) {
        analysis.opportunities.push({
          address: record['Address'] || record['Property Address'] || 'N/A',
          price: price,
          score: distressScore,
          status: status
        });
      }
    });

    // Sort opportunities by score
    analysis.opportunities.sort((a, b) => b.score - a.score);

    // Create summary
    analysis.summary = {
      totalProperties: data.length,
      topOpportunities: analysis.opportunities.slice(0, 10).length,
      avgOpportunityScore: analysis.opportunities.length > 0 
        ? (analysis.opportunities.reduce((sum, o) => sum + o.score, 0) / analysis.opportunities.length).toFixed(2)
        : 0,
      mostCommonType: Object.entries(analysis.propertyTypes).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A',
      mostCommonLocation: Object.entries(analysis.locations).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
    };

    return analysis;
  }

  printAnalysisReport(analysis) {
    console.log('\n' + '='.repeat(70));
    console.log('📊 INVESTOR DATA ANALYSIS REPORT');
    console.log('='.repeat(70));
    
    console.log('\n📈 SUMMARY:');
    console.log(`   Total Properties: ${analysis.summary.totalProperties}`);
    console.log(`   High-Value Opportunities: ${analysis.summary.topOpportunities}`);
    console.log(`   Average Opportunity Score: ${analysis.summary.avgOpportunityScore}`);
    console.log(`   Most Common Type: ${analysis.summary.mostCommonType}`);
    console.log(`   Most Common Location: ${analysis.summary.mostCommonLocation}`);

    console.log('\n🏠 PROPERTY TYPE DISTRIBUTION:');
    Object.entries(analysis.propertyTypes)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        console.log(`   ${type}: ${count} properties`);
      });

    console.log('\n💰 PRICE RANGE DISTRIBUTION:');
    Object.entries(analysis.priceRanges)
      .forEach(([range, count]) => {
        console.log(`   ${range}: ${count} properties`);
      });

    console.log('\n📍 LOCATION DISTRIBUTION:');
    Object.entries(analysis.locations)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([location, count]) => {
        console.log(`   ${location}: ${count} properties`);
      });

    console.log('\n🎯 TOP 10 OPPORTUNITIES:');
    analysis.opportunities.slice(0, 10).forEach((opp, index) => {
      console.log(`   ${index + 1}. ${opp.address}`);
      console.log(`      Price: $${opp.price.toLocaleString()} | Score: ${opp.score} | Status: ${opp.status}`);
    });

    console.log('\n' + '='.repeat(70));
  }

  async saveToJSON(data, analysis) {
    const outputDir = path.join(__dirname, '../data');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    
    // Save raw data
    const dataPath = path.join(outputDir, `investor-data-${timestamp}.json`);
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    console.log(`\n💾 Raw data saved: ${dataPath}`);

    // Save analysis
    const analysisPath = path.join(outputDir, `investor-analysis-${timestamp}.json`);
    fs.writeFileSync(analysisPath, JSON.stringify(analysis, null, 2));
    console.log(`💾 Analysis saved: ${analysisPath}`);

    // Save latest copy
    fs.writeFileSync(path.join(outputDir, 'investor-data-latest.json'), JSON.stringify(data, null, 2));
    fs.writeFileSync(path.join(outputDir, 'investor-analysis-latest.json'), JSON.stringify(analysis, null, 2));

    return { dataPath, analysisPath };
  }
}

// Main execution
async function main() {
  console.log('🚀 STARTING INVESTOR DATA INTEGRATION');
  console.log('=====================================\n');

  const integration = new InvestorDataIntegration();
  
  // Step 1: Initialize
  const initialized = await integration.initialize();
  if (!initialized) {
    console.log('\n⚠️  Running in limited mode without authentication');
  }

  // Step 2: Fetch data
  const { headers, data, error } = await integration.fetchInvestorData();
  
  if (error) {
    console.error('\n❌ INTEGRATION FAILED');
    console.error(`   Error: ${error}`);
    process.exit(1);
  }

  if (data.length === 0) {
    console.log('\n⚠️  No data to analyze');
    process.exit(0);
  }

  // Step 3: Analyze
  const analysis = await integration.analyzeInvestorData(data);

  // Step 4: Print report
  integration.printAnalysisReport(analysis);

  // Step 5: Save results
  await integration.saveToJSON(data, analysis);

  console.log('\n✅ INTEGRATION COMPLETE');
  console.log('   Data is ready for investor meeting!');
  console.log('   Check the data/ directory for JSON files\n');
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { InvestorDataIntegration };
