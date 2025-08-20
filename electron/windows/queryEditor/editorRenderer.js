const { InvalidateQueryCache } = require('../../../Common/functions');
// const { SendPing, InvalidateQueryCache, GetQueriesBasePath } = require('../Common/functions')


let editor;
let filePath = '';
let originalFilename = '';

window.queryEditor.onLoad(({ filename, content, fullPath }) => {
  document.getElementById('file-title').innerText = filename;
  filePath = fullPath;
  originalFilename = filename;

  if (editor) {
    editor.toTextArea(); // Ýokarydakylaryň öňki redaktoryny arassalamak
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
  window.queryEditor.saveFile(filePath, newContent)
    .then(() => {
      alert('Faýl üstünlikli ýatda saklandy!');
      window.queryEditor.onFileSaved(filePath, newContent);
      console.log('File saved successfully:', filePath);
      InvalidateQueryCache(filePath, newContent);
    })
    .catch((error) => {
      alert('Ýalňyşlyk: Faýl ýatda saklanmady. Sebäp: ' + error.message);
    });
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
  const defaultBasePath = getQueriesBasePath('Default', 'QueriesDefault');

  const mapping = {
    // Generals
    'GetCheckSumsQuery.sql': 'generals\\checksums\\GetCheckSumsQuery.sql',
    'GetContactsQuery.sql': 'generals\\contacts\\GetContactsQuery.sql',
    'GetFirmDataQueryDefault.sql': 'generals\\firm_data\\GetFirmDataQueryDefault.sql',
    'GetFirmDataQueryHosting.sql': 'generals\\firm_data\\GetFirmDataQueryHosting.sql',
    'GetOptionsQuery.sql': 'generals\\options\\GetOptionsQuery.sql',
    'GetPartnersQueryDefault.sql': 'generals\\partners\\GetPartnersQueryDefault.sql',
    'GetPartnersQueryHosting.sql': 'generals\\partners\\GetPartnersQueryHosting.sql',
    'GetRestrictionSettingsQuery.sql': 'generals\\restr_settings\\GetRestrictionSettingsQuery.sql',
    'GetRouteDetailsQuery.sql': 'generals\\route_plans\\GetRouteDetailsQuery.sql',
    'GetRoutePartnersQuery.sql': 'generals\\route_plans\\GetRoutePartnersQuery.sql',
    'GetRoutePlansMainQuery.sql': 'generals\\route_plans\\GetRoutePlansMainQuery.sql',
    'GetSalesmansQuery.sql': 'generals\\salesmans\\GetSalesmansQuery.sql',
    'GetStatusesQuery.sql': 'generals\\statuses\\GetStatusesQuery.sql',
    'GetUsingTargetPlansQuery.sql': 'generals\\using_target\\GetUsingTargetPlansQuery.sql',

    // Materials
    'GetAllMaterialsHostingQuery.sql': 'materials\\all_materials\\GetAllMaterialsHostingQuery.sql',
    'GetAllMaterialsQuery.sql': 'materials\\all_materials\\GetAllMaterialsQuery.sql',
    'GetAttributesQuery.sql': 'materials\\attributes\\GetAttributesQuery.sql',
    'GetBarcodesQuery.sql': 'materials\\barcodes\\GetBarcodesQuery.sql',
    'GetCurrencyQuery.sql': 'materials\\currency_and_pr_types\\GetCurrencyQuery.sql',
    'GetPrTypesQuery.sql': 'materials\\currency_and_pr_types\\GetPrTypesQuery.sql',
    'GetGroupsQuery.sql': 'materials\\groups\\GetGroupsQuery.sql',
    'GetLastPricesQuery.sql': 'materials\\last_prices\\GetLastPricesQuery.sql',
    'GetMaterialImageQuery.sql': 'materials\\material_image\\GetMaterialImageQuery.sql',
    'GetMaterialPricesQuery.sql': 'materials\\material_prices\\GetMaterialPricesQuery.sql',
    'GetMaterialsImgIDQuery.sql': 'materials\\mat_img_id\\GetMaterialsImgIDQuery.sql',
    'GetMtrlAttrUnitQuery.sql': 'materials\\mtrl_attr_unit\\GetMtrlAttrUnitQuery.sql',
    'UnitDetailsBasic.sql': 'materials\\unit_and_details\\UnitDetailsBasic.sql',
    'UnitDetailsWithQuery.sql': 'materials\\material_units\\UnitDetailsWithQuery.sql',
    'UnitsList.sql': 'materials\\material_units\\UnitsList.sql',
    'UnitsWithGuid.sql': 'materials\\unit_and_details\\UnitsWithGuid.sql',

    // Reports
    'GetSalesByMaterialsQuery.sql': 'reports\\sales_b_materials\\GetSalesByMaterialsQuery.sql',

    // Warehouses
    'GetPersonalStockQuery.sql': 'werehouses\\personal_stock\\GetPersonalStockQuery.sql',
    'MainWhStock.sql': 'werehouses\\stock_by_whouse\\MainWhStock.sql',
    'OtherWhStock.sql': 'werehouses\\stock_by_whouse\\OtherWhStock.sql',
    'WarehouseListWithStatus.sql': 'werehouses\\warehouse_data\\WarehouseListWithStatus.sql',
    'WarehousesWithFirm.sql': 'werehouses\\warehouse_data\\WarehousesWithFirm.sql'
  };

  if (mapping[filename]) {
    return `${defaultBasePath}\\${mapping[filename]}`;
  }
  return null;
}

document.getElementById('confirmation-overlay').addEventListener('click', (e) => {
  if (e.target === document.getElementById('confirmation-overlay')) {
    hideConfirmationDialog();
  }
});

function getQueriesBasePath(tabFolderName, inTabFolder) {
  let queriesPath = window.nodeUtils.homeDir();
  queriesPath = queriesPath + '\\AppData\\Local\\ServerSolution\\connections';

  if (tabFolderName) {
    queriesPath = queriesPath + `\\ServerSolution${String(tabFolderName)}`;
  }

  if (inTabFolder) {
    queriesPath = queriesPath + `\\${inTabFolder}`;
  }

  return queriesPath;
}