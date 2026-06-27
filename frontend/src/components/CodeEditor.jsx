import Editor from "@monaco-editor/react";
import { useState, useEffect } from "react";
import socket from "../socket";
import axios from "axios";

function CodeEditor({ roomId }) {
  const [code, setCode] = useState(
`console.log("Hello World");`
);
  const [language, setLanguage] = useState("javascript");
  const [loading, setLoading] = useState(true);
  const [output, setOutput] = useState("");

  // LOAD SAVED CODE FROM DATABASE
  useEffect(() => {
    const fetchCode = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/code/${roomId}`
        );

        if (res.data?.code) {
          setCode(res.data.code);
        }

        if (res.data?.language) {
          setLanguage(res.data.language);
        }
      } catch (err) {
        console.log("Failed to load code:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCode();
  }, [roomId]);

  const handleChange = (value) => {
    setCode(value || "");

    socket.emit("code-change", {
      roomId,
      code: value || "",
      language,
    });
  };

  const runCode = () => {
    try {
      const logs = [];

      const originalLog = console.log;

      console.log = (...args) => {
        logs.push(args.join(" "));
      };

      eval(code);

      console.log = originalLog;

      setOutput(
        logs.length
          ? logs.join("\n")
          : "Code executed successfully"
      );
    } catch (err) {
      setOutput("Error: " + err.message);
    }
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;

    setLanguage(newLanguage);

    socket.emit("code-change", {
      roomId,
      code,
      language: newLanguage,
    });
  };

  // REAL-TIME CODE SYNC
  useEffect(() => {
    socket.on("code-update", (newCode) => {
      setCode(newCode);
    });

    return () => {
      socket.off("code-update");
    };
  }, []);

  return (
    <div className="code-editor-container">
      <div className="code-editor-toolbar">
        <label htmlFor="language-select">Language:</label>
        <span
          style={{
            fontWeight: "bold",
            color: "#2563eb",
          }}
        >
          JavaScript
        </span>

        <button
  onClick={runCode}
  style={{
    marginLeft: "10px",
    padding: "6px 12px",
    background: "#22c55e",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  }}
>
  ▶ Run
</button>
      </div>

 <div className="code-editor-content">
  {loading ? (
    <div
      style={{
        padding: "20px",
        textAlign: "center",
      }}
    >
      Loading editor...
    </div>
  ) : (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Editor
        height="350px"
        language={language}
        value={code}
        onChange={handleChange}
        theme="vs-light"
        options={{
          minimap: {
            enabled: false,
          },
          wordWrap: "on",
          fontSize: 14,
        }}
      />

      <div
        style={{
          background: "#111827",
          color: "#f3f4f6",
          padding: "12px",
          height: "150px",
          overflowY: "auto",
          borderTop:
            "3px solid #22c55e",
        }}
      >
        <div
          style={{
            fontWeight: "bold",
            marginBottom: "8px",
          }}
        >
          Console Output
        </div>

        <pre
          style={{
            margin: 0,
            whiteSpace:
              "pre-wrap",
          }}
        >
          {output}
        </pre>
      </div>
    </div>
  )}
</div>
    </div>
  );
}

export default CodeEditor;