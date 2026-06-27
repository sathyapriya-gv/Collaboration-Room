import pathlib
path = pathlib.Path(r'c:\Users\SATHYAPRIYA\AppData\Roaming\Code\User\workspaceStorage\bbf89080117fdfa11d50ccfa48bc1536\GitHub.copilot-chat\chat-session-resources\09ab8e1d-e68a-43f8-843d-4bca650ef224\call_qTr0XUrvBgfdgu45IKG2d1Ge__vscode-1780844629556\content.txt')
text = path.read_text('utf-8', errors='ignore')
patterns = [
    'function ChatBox',
    'function OnlineUsers',
    'function Room',
    'function CodeEditor',
    'function Whiteboard',
    'function ScreenShare',
    'function FileShare',
]
with open('recovered_matches.txt', 'w', encoding='utf-8') as out:
    for pattern in patterns:
        idx = text.find(pattern)
        if idx != -1:
            start = max(0, idx - 500)
            end = min(len(text), idx + 2800)
            snippet = text[start:end].replace('\\n', '\n').replace('\\"', '"')
            out.write(f'=== MATCH: {pattern} ===\n')
            out.write(snippet)
            out.write('\n\n')
