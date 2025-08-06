let editor;
let filePath = '';
let originalFilename = '';

window.queryEditor.onLoad(({ filename, content, fullPath }) => {
  document.getElementById('file-title').innerText = filename;
  filePath = fullPath;
  originalFilename = filename;

  editor = CodeMirror.fromTextArea(document.getElementById('code-area'), {
    mode: 'text/x-sql',
    theme: 'material-darker',
    mode: "sql",
    lineNumbers: true,
    indentWithTabs: true,
    smartIndent: true,
    matchBrackets: true,
    autofocus: true
  });
  editor.setSize(null, '100%');
  editor.setValue(content);
});

// Save button functionality (öňkiden bar bolan)
document.getElementById('save-btn').addEventListener('click', () => {
  const newContent = editor.getValue();
  window.queryEditor.saveFile(filePath, newContent);
});

// Täze Restore Default Query functionality
document.getElementById('restore-btn').addEventListener('click', () => {
  showConfirmationDialog();
});

function showConfirmationDialog() {
  document.getElementById('confirmation-overlay').style.display = 'flex';
}

function hideConfirmationDialog() {
  document.getElementById('confirmation-overlay').style.display = 'none';
}

// Yes button - proceed with restore
document.getElementById('confirm-yes').addEventListener('click', async () => {
  hideConfirmationDialog();
  await restoreDefaultQuery();
});

// No button - cancel restore
document.getElementById('confirm-no').addEventListener('click', () => {
  hideConfirmationDialog();
});

async function restoreDefaultQuery() {
  try {
    // Map current filename to default query directory structure
    const defaultQueryPath = getDefaultQueryPath(originalFilename);
    
    if (defaultQueryPath) {
      // Default faýldan mazmuny okamak
      const defaultContent = await window.queryEditor.readDefaultQuery(defaultQueryPath);
      
      if (defaultContent) {
        // Häzirki mazmuny default bilen çalyşmak
        editor.setValue(defaultContent);
        
        // Restore edilen mazmuny saklamak
        await window.queryEditor.saveFile(filePath, defaultContent);
        
        console.log('Default query restored successfully');
      } else {
        console.error('Could not read default query file');
        alert('Default query faýly tapylmady!');
      }
    } else {
      console.error('Could not map filename to default query path');
      alert('Bu faýl üçin default query tapylmady!');
    }
  } catch (error) {
    console.error('Error restoring default query:', error);
    alert('Default query restore edilende ýalňyşlyk boldy!');
  }
}

function getDefaultQueryPath(filename) {
  // Faýl atlaryny default papka ýollaryna gabat getirmek
  const defaultPaths = {
    // Generals
    'GetCheckSumsQuery.sql': 'C:\\ProgramData\\ServerSolutionDefault\\QueriesDefoult\\Generals\\GetCheckSumsQuery.sql',
    'GetContactsQuery.sql': 'C:\\ProgramData\\ServerSolutionDefault\\QueriesDefoult\\Generals\\GetContactsQuery.sql',
    'GetFirmDataQueryDefault.sql': 'C:\\ProgramData\\ServerSolutionDefault\\QueriesDefoult\\Generals\\GetFirmDataQueryDefault.sql',
    'GetFirmDataQueryHosting.sql': 'C:\\ProgramData\\ServerSolutionDefault\\QueriesDefoult\\Generals\\GetFirmDataQueryHosting.sql',
    'GetOptionsQuery.sql': 'C:\\ProgramData\\ServerSolutionDefault\\QueriesDefoult\\Generals\\GetOptionsQuery.sql',
    'GetPartnersQueryDefault.sql': 'C:\\ProgramData\\ServerSolutionDefault\\QueriesDefoult\\Generals\\GetPartnersQueryDefault.sql',
    'GetPartnersQueryHosting.sql': 'C:\\ProgramData\\ServerSolutionDefault\\QueriesDefoult\\Generals\\GetPartnersQueryHosting.sql',
    'GetRestrictionSettingsQuery.sql': 'C:\\ProgramData\\ServerSolutionDefault\\QueriesDefoult\\Generals\\GetRestrictionSettingsQuery.sql',
    'GetRouteDetailsQuery.sql': 'C:\\ProgramData\\ServerSolutionDefault\\QueriesDefoult\\Generals\\GetRouteDetailsQuery.sql',
    'GetRoutePartnersQuery.sql': 'C:\\ProgramData\\ServerSolutionDefault\\QueriesDefoult\\Generals\\GetRoutePartnersQuery.sql',
    'GetRoutePlansMainQuery.sql': 'C:\\ProgramData\\ServerSolutionDefault\\QueriesDefoult\\Generals\\GetRoutePlansMainQuery.sql',
    'GetSalesmansQuery.sql': 'C:\\ProgramData\\ServerSolutionDefault\\QueriesDefoult\\Generals\\GetSalesmansQuery.sql',
    'GetStatusesQuery.sql': 'C:\\ProgramData\\ServerSolutionDefault\\QueriesDefoult\\Generals\\GetStatusesQuery.sql',
    'GetUsingTargetPlansQuery.sql': 'C:\\ProgramData\\ServerSolutionDefault\\QueriesDefoult\\Generals\\GetUsingTargetPlansQuery.sql',
    
    // Materials
    'GetAllMaterialsHostingQuery.sql': 'C:\\ProgramData\\ServerSolutionDefault\\QueriesDefoult\\Materials\\GetAllMaterialsHostingQuery.sql',
    'GetAllMaterialsQuery.sql': 'C:\\ProgramData\\ServerSolutionDefault\\QueriesDefoult\\Materials\\GetAllMaterialsQuery.sql',
    'GetAttributesQuery.sql': 'C:\\ProgramData\\ServerSolutionDefault\\QueriesDefoult\\Materials\\GetAttributesQuery.sql',
    'GetBarcodesQuery.sql': 'C:\\ProgramData\\ServerSolutionDefault\\QueriesDefoult\\Materials\\GetBarcodesQuery.sql',
    'GetCurrencyQuery.sql': 'C:\\ProgramData\\ServerSolutionDefault\\QueriesDefoult\\Materials\\GetCurrencyQuery.sql',
    'GetGroupsQuery.sql': 'C:\\ProgramData\\ServerSolutionDefault\\QueriesDefoult\\Materials\\GetGroupsQuery.sql',
    'GetLastPricesQuery.sql': 'C:\\ProgramData\\ServerSolutionDefault\\QueriesDefoult\\Materials\\GetLastPricesQuery.sql',
    'GetMaterialImageQuery.sql': 'C:\\ProgramData\\ServerSolutionDefault\\QueriesDefoult\\Materials\\GetMaterialImageQuery.sql',
    'GetMaterialPricesQuery.sql': 'C:\\ProgramData\\ServerSolutionDefault\\QueriesDefoult\\Materials\\GetMaterialPricesQuery.sql',
    'GetMaterialsImgIDQuery.sql': 'C:\\ProgramData\\ServerSolutionDefault\\QueriesDefoult\\Materials\\GetMaterialsImgIDQuery.sql',
    'GetMtrlAttrUnitQuery.sql': 'C:\\ProgramData\\ServerSolutionDefault\\QueriesDefoult\\Materials\\GetMtrlAttrUnitQuery.sql',
    'GetPrTypesQuery.sql': 'C:\\ProgramData\\ServerSolutionDefault\\QueriesDefoult\\Materials\\GetPrTypesQuery.sql',
    'UnitDetailsBasic.sql': 'C:\\ProgramData\\ServerSolutionDefault\\QueriesDefoult\\Materials\\UnitDetailsBasic.sql',
    'UnitDetailsWithQuery.sql': 'C:\\ProgramData\\ServerSolutionDefault\\QueriesDefoult\\Materials\\UnitDetailsWithQuery.sql',
    'UnitsList.sql': 'C:\\ProgramData\\ServerSolutionDefault\\QueriesDefoult\\Materials\\UnitsList.sql',
    'UnitsWithGuid.sql': 'C:\\ProgramData\\ServerSolutionDefault\\QueriesDefoult\\Materials\\UnitsWithGuid.sql',
    
    // Reports
    'GetSalesByMaterialsQuery.sql': 'C:\\ProgramData\\ServerSolutionDefault\\QueriesDefoult\\Reports\\GetSalesByMaterialsQuery.sql',
    
    // Warehouses
    'GetCalcOrdAmountQuery.sql': 'C:\\ProgramData\\ServerSolutionDefault\\QueriesDefoult\\Werehouses\\GetCalcOrdAmountQuery.sql',
    'GetMainQuery.sql': 'C:\\ProgramData\\ServerSolutionDefault\\QueriesDefoult\\Werehouses\\GetMainQuery.sql',
    'GetPersonalStockQuery.sql': 'C:\\ProgramData\\ServerSolutionDefault\\QueriesDefoult\\Werehouses\\GetPersonalStockQuery.sql',
    'MainWhStock.sql': 'C:\\ProgramData\\ServerSolutionDefault\\QueriesDefoult\\Werehouses\\MainWhStock.sql',
    'SpRecalcTotals.sql': 'C:\\ProgramData\\ServerSolutionDefault\\QueriesDefoult\\Werehouses\\SpRecalcTotals.sql',
    'WarehousesWithFirm.sql': 'C:\\ProgramData\\ServerSolutionDefault\\QueriesDefoult\\Werehouses\\WarehousesWithFirm.sql',
    'warehouseListWithStatus.sql': 'C:\\ProgramData\\ServerSolutionDefault\\QueriesDefoult\\Werehouses\\WarehouseListWithStatus.sql'
  };
  
  return defaultPaths[filename];
}

// Close dialog when clicking overlay
document.getElementById('confirmation-overlay').addEventListener('click', (e) => {
  if (e.target === document.getElementById('confirmation-overlay')) {
    hideConfirmationDialog();
  }
});