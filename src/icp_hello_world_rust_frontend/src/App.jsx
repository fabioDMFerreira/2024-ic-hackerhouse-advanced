import { useState, useEffect, useRef } from 'react';
import { icp_gpt2 } from 'declarations/icp_gpt2';
import { encode, decode } from 'gpt-tokenizer/model/davinci-002';

// Load the GPT-2 tokenizer
function tokenizeText(text) {
  const tokens = encode(text);
  return tokens;
}

function tokenIdsToText(tokenIds) {
  const decodedText = decode(tokenIds);
  return decodedText;
}

function App() {
  const [text, setText] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [loading, setLoading] = useState(false);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = () => {
      if (text) {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
          handleSubmit();
        }, 1000);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [text]);

  function handleChange(event) {
    setText(event.target.value);
    setSuggestion(''); // Clear suggestion when user starts typing
  }

  function handleSubmit() {
    setLoading(true);

    const extractLastWords = (text) => {
      const words = text.split(' ');
      return words.slice(-10).join(' ');
    };

    const lastWords = extractLastWords(text);

    const tokensIds = tokenizeText(lastWords);
    console.log(tokensIds);
    icp_gpt2.model_inference(tokensIds.length, tokensIds).then((result) => {
      const resultUnwrapped = result.Ok;
      const decodedText = tokenIdsToText(resultUnwrapped);
      console.log(decodedText);
      setSuggestion(decodedText);
      setLoading(false);
    });
  }

  return (
    <main>
      <textarea
        id="text"
        value={text}
        onChange={handleChange}
        placeholder="Start typing..."
        style={{ width: '100%', height: '200px' }}
      />
      <section id="suggestion">{loading ? 'Loading...' : suggestion}</section>
      {suggestion && (
        <button
          onClick={() => {
            setText(text + ' ' + suggestion);
            setSuggestion('');
          }}
          disabled={loading}
        >
          Insert
        </button>
      )}
    </main>
  );
}

export default App;
