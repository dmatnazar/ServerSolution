// REQUIRE-lary aýyrdyk, sebäbi browser kontekstinde işlemeýär
let editor;
let filePath = '';
let originalFilename = '';

window.queryEditor.onLoad(({ filename, content, fullPath }) => {
  document.getElementById('file-title').innerText = filename;
  filePath = fullPath;
  originalFilename = filename;

  if (editor) {
    editor.toTextArea(); // Эгер мурдагы редактор болсо, тазалап кой
  }

  editor = CodeMirror.fromTextArea(document.getElementById('code-area'), {
    mode: 'text/x-sql',
    theme: 'material-darker',
    lineNumbers: true,
    indentWithTabs: true,
    smartIndent: true,
    matchBrackets: true,
    autofocus: true
  });
  editor.setSize(null, '100%');
  editor.setValue(content);
});

document.getElementById('save-btn').addEventListener('click', () => {
  const newContent = editor.getValue();
  window.queryEditor.saveFile(filePath, newContent);
});

document.getElementById('restore-btn').addEventListener('click', () => {
  showConfirmationDialog();
});

function showConfirmationDialog() {
  document.getElementById('confirmation-overlay').style.display = 'flex';
}

function hideConfirmationDialog() {
  document.getElementById('confirmation-overlay').style.display = 'none';
}

document.getElementById('confirm-yes').addEventListener('click', async () => {
  hideConfirmationDialog();
  await restoreDefaultQuery();
});

document.getElementById('confirm-no').addEventListener('click', () => {
  hideConfirmationDialog();
});

async function restoreDefaultQuery() {
  try {
    const defaultQueryPath = getDefaultQueryPath(originalFilename);

    if (!defaultQueryPath) {
      alert('Bu faýl üçin default query tapylmady!');
      console.error('Could not map filename to default query path');
      return;
    }

    const defaultContent = await window.queryEditor.readDefaultQuery(defaultQueryPath);

    if (!defaultContent) {
      alert('Default query faýly tapylmady!');
      console.error('Could not read default query file');
      return;
    }

    editor.setValue(defaultContent);
    await window.queryEditor.saveFile(filePath, defaultContent);
    console.log('Default query restored successfully');
  } catch (error) {
    console.error('Error restoring default query:', error);
    alert('An error occurred while restoring the default query!');
  }
}

function getDefaultQueryPath(filename) {
  const homeDir = window.nodeUtils.homeDir();
  const defaultBasePath = `${homeDir}\\AppData\\Local\\ServerSolution\\connections\\ServerSolutionDefault\\QueriesDefault`;

  const mapping = {
    // Generals
    'GetCheckSumsQuery.sql': 'Generals\\GetCheckSumsQuery.sql',
    'GetContactsQuery.sql': 'Generals\\GetContactsQuery.sql',
    'GetFirmDataQueryDefault.sql': 'Generals\\GetFirmDataQueryDefault.sql',
    'GetFirmDataQueryHosting.sql': 'Generals\\GetFirmDataQueryHosting.sql',
    'GetOptionsQuery.sql': 'Generals\\GetOptionsQuery.sql',
    'GetPartnersQueryDefault.sql': 'Generals\\GetPartnersQueryDefault.sql',
    'GetPartnersQueryHosting.sql': 'Generals\\GetPartnersQueryHosting.sql',
    'GetRestrictionSettingsQuery.sql': 'Generals\\GetRestrictionSettingsQuery.sql',
    'GetRouteDetailsQuery.sql': 'Generals\\GetRouteDetailsQuery.sql',
    'GetRoutePartnersQuery.sql': 'Generals\\GetRoutePartnersQuery.sql',
    'GetRoutePlansMainQuery.sql': 'Generals\\GetRoutePlansMainQuery.sql',
    'GetSalesmansQuery.sql': 'Generals\\GetSalesmansQuery.sql',
    'GetStatusesQuery.sql': 'Generals\\GetStatusesQuery.sql',
    'GetUsingTargetPlansQuery.sql': 'Generals\\GetUsingTargetPlansQuery.sql',

    // Materials
    'GetAllMaterialsHostingQuery.sql': 'Materials\\GetAllMaterialsHostingQuery.sql',
    'GetAllMaterialsQuery.sql': 'Materials\\GetAllMaterialsQuery.sql',
    'GetAttributesQuery.sql': 'Materials\\GetAttributesQuery.sql',
    'GetBarcodesQuery.sql': 'Materials\\GetBarcodesQuery.sql',
    'GetCurrencyQuery.sql': 'Materials\\GetCurrencyQuery.sql',
    'GetGroupsQuery.sql': 'Materials\\GetGroupsQuery.sql',
    'GetLastPricesQuery.sql': 'Materials\\GetLastPricesQuery.sql',
    'GetMaterialImageQuery.sql': 'Materials\\GetMaterialImageQuery.sql',
    'GetMaterialPricesQuery.sql': 'Materials\\GetMaterialPricesQuery.sql',
    'GetMaterialsImgIDQuery.sql': 'Materials\\GetMaterialsImgIDQuery.sql',
    'GetMtrlAttrUnitQuery.sql': 'Materials\\GetMtrlAttrUnitQuery.sql',
    'GetPrTypesQuery.sql': 'Materials\\GetPrTypesQuery.sql',
    'UnitDetailsBasic.sql': 'Materials\\UnitDetailsBasic.sql',
    'UnitDetailsWithQuery.sql': 'Materials\\UnitDetailsWithQuery.sql',
    'UnitsList.sql': 'Materials\\UnitsList.sql',
    'UnitsWithGuid.sql': 'Materials\\UnitsWithGuid.sql',

    // Reports
    'GetSalesByMaterialsQuery.sql': 'Reports\\GetSalesByMaterialsQuery.sql',

    // Warehouses
    'GetCalcOrdAmountQuery.sql': 'Werehouses\\GetCalcOrdAmountQuery.sql',
    'GetMainQuery.sql': 'Werehouses\\GetMainQuery.sql',
    'GetPersonalStockQuery.sql': 'Werehouses\\GetPersonalStockQuery.sql',
    'MainWhStock.sql': 'Werehouses\\MainWhStock.sql',
    'SpRecalcTotals.sql': 'Werehouses\\SpRecalcTotals.sql',
    'WarehousesWithFirm.sql': 'Werehouses\\WarehousesWithFirm.sql',
    'warehouseListWithStatus.sql': 'Werehouses\\WarehouseListWithStatus.sql'
  };

  if (mapping[filename]) {
    // Manual path joining for Windows
    return `${defaultBasePath}\\${mapping[filename]}`;
  }
  return null;
}

document.getElementById('confirmation-overlay').addEventListener('click', (e) => {
  if (e.target === document.getElementById('confirmation-overlay')) {
    hideConfirmationDialog();
  }
});