Fix the buges and make the functionality of the main page like this  :
import { useState, useReducer, useEffect, useCallback } from 'react';
import BackButton from '../components/Layout/BackButton';
import SettingsPanel from '../components/Layout/SettingsPanel';
import LoadingSpinner from '../components/Layout/LoadingSpinner';
import PreviewModal from '../components/Form/PreviewModal';
import { formReducer, initialFormState } from '../hooks/useFormReducer';
import { formatRIB, parseRIB } from '../utils/formatRIB';
import { translations } from '../utils/translations';

export default function MainPage({ currentUser, darkMode, language }) {
  const t = translations[language];
  const [formMode, setFormMode] = useState('single');
  const [traiteData, dispatch] = useReducer(formReducer, initialFormState);
  const [ribFields, setRibFields] = useState([{ rib: '', bank: '' }]);
  const [history, setHistory] = useState([]);
  const [previewTraites, setPreviewTraites] = useState([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState(false);

  // Load history on mount
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("kenbiyela_history") || "[]");
    setHistory(saved);
  }, []);

  // Autosave form data
  useEffect(() => {
    const { rib: _rib, ...savableData } = traiteData;
    localStorage.setItem('traiteFormData', JSON.stringify(savableData));
  }, [traiteData]);

  // Tooltip handlers
  const showTooltip = (text, e) => {
    setTooltip({ show: true, text, x: e.clientX, y: e.clientY + 20 });
  };
  const hideTooltip = useCallback(() => setTooltip({ show: false, text: '', x: 0, y: 0 }), []);

  // Handle RIB fields
  const addRIBField = () => { if (ribFields.length < 3) setRibFields([...ribFields, { rib: '', bank: '' }]); };
  const removeRIBField = (i) => { setRibFields(ribFields.filter((_, idx) => idx !== i)); };
  const updateRIBField = (i, field, value) => {
    const newFields = [...ribFields]; newFields[i][field] = field === 'rib' ? parseRIB(value) : value; setRibFields(newFields);
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    if (!traiteData.dateEcheance) errors.dateEcheance = t.dateRequired;
    if (!traiteData.montant || parseFloat(traiteData.montant) <= 0) errors.montant = t.montantRequired;
    if (!traiteData.ville) errors.ville = t.villeRequired;
    if (!traiteData.aLordreDe) errors.aLordreDe = t.aLordreDeRequired;
    if (!traiteData.payeur) errors.payeur = t.payeurRequired;
    if (!traiteData.responsabiliteChecked) errors.responsabiliteChecked = t.responsibilityRequired;
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Show preview
  const handleShowPreview = () => {
    if (!validateForm()) return;
    const n = formMode === 'multiple' ? (traiteData.nombreTraites || 1) : 1;
    const totalAmount = parseFloat(traiteData.montant) || 0;
    const montantParTraite = formMode === 'multiple' ? (totalAmount / n).toFixed(3) : totalAmount;
    const newPreview = Array.from({ length: n }, (_, i) => ({
      id: i + 1,
      montant: montantParTraite,
      dateEcheance: new Date(traiteData.dateEdition).toISOString().split('T')[0]
    }));
    setPreviewTraites(newPreview);
    setShowPreviewModal(true);
  };

  // Save preview to history
  const saveToHistory = () => {
    const entry = { id: Date.now(), date: new Date().toISOString(), bills: previewTraites, total: traiteData.montant, mode: formMode, traiteData };
    const updated = [...history, entry];
    setHistory(updated);
    localStorage.setItem("kenbiyela_history", JSON.stringify(updated));
  };

  // Submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return alert(t.pleaseFixErrors);
    handleShowPreview();
  };

  if (isProcessing) return <LoadingSpinner />;

  return (
    <div className={`min-h-screen p-4 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
      {tooltip.show && <div style={{ left: tooltip.x, top: tooltip.y }} className="fixed z-50 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm">{tooltip.text}</div>}
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <BackButton onClick={() => console.log('Back clicked')} label={t.backToMain} />
          <SettingsPanel />
        </div>
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md space-y-4">
          {/* Mode selection */}
          <div className="flex gap-4">
            <button type="button" className={`px-4 py-2 rounded-lg ${formMode === 'single' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`} onClick={() => setFormMode('single')}>{t.singleTraite}</button>
            <button type="button" className={`px-4 py-2 rounded-lg ${formMode === 'multiple' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`} onClick={() => setFormMode('multiple')}>{t.multipleTraites}</button>
          </div>

          {/* RIBs */}
          <div className="space-y-2">
            {ribFields.map((f, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-2 items-end">
                <input
                  type="text"
                  placeholder="RIB (20 digits)"
                  value={formatRIB(f.rib)}
                  onChange={(e) => updateRIBField(i, 'rib', e.target.value)}
                  className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Bank Name"
                  value={f.bank}
                  onChange={(e) => updateRIBField(i, 'bank', e.target.value)}
                  className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                {ribFields.length > 1 && <button type="button" onClick={() => removeRIBField(i)} className="text-red-500 text-sm font-semibold">Remove</button>}
              </div>
            ))}
            {ribFields.length < 3 && <button type="button" onClick={() => addRIBField()} className="text-blue-600 text-sm font-semibold">Add Another RIB</button>}
          </div>

          {/* Amount */}
          <input type="number" placeholder={t.montant} value={traiteData.montant} onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'montant', value: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />

          {/* City */}
          <input type="text" placeholder={t.ville} value={traiteData.ville} onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'ville', value: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />

          {/* Submit */}
          <button type="submit" className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700">
            {t.showPreview}
          </button>
        </form>
      </div>

      {/* Preview Modal */}
      {showPreviewModal && <PreviewModal previewTraites={previewTraites} onClose={() => setShowPreviewModal(false)} onSave={saveToHistory} />}
    </div>
  );
}
