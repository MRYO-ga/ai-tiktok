

const ModelSelector = ({ selectedModel, setSelectedModel, models }) => (
    <select
        id="model-select"
        value={selectedModel}
        onChange={(e) => setSelectedModel(e.target.value)}
        className="p-2 border rounded-full bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm transition-all duration-300"
    >
        {models.map(model => (
            <option key={model} value={model}>{model}</option>
        ))}
    </select>
);

window.ModelSelector = ModelSelector;
