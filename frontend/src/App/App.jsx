import "./App.css";
import { Editor } from "@monaco-editor/react";
import { MonacoBinding } from "y-monaco";
import { useRef, useMemo, useState, useEffect } from "react";
import * as Y from "yjs";
import { SocketIOProvider } from "y-socket.io";
import DrawingBoard from "./DrawingBoard";
import { SiCollaboraonline } from "react-icons/si";

function App() {
  const editorRef = useRef(null);
  const [username, setUsername] = useState(() => {
    return new URLSearchParams(window.location.search).get("username") || "";
  });
  const [users, setUsers] = useState([]);
  const [currentView, setCurrentView] = useState("editor");
  const [language, setLanguage] = useState("javascript");
  const [roomId, setRoomId] = useState("");
  const [inputRoomId, setInputRoomId] = useState("");
  const [showJoinRoom, setShowJoinRoom] = useState(false);
  const [provider, setProvider] = useState(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const ydoc = useMemo(() => new Y.Doc(), []);
  const yText = useMemo(() => ydoc.getText("monaco"), [ydoc]);

  const handleMount = (editor) => {
    editorRef.current = editor;

    new MonacoBinding(
      yText,
      editorRef.current.getModel(),
      new Set([editorRef.current]),
    );
  };

  const handleJoin = (e) => {
    e.preventDefault();
    setUsername(e.target.username.value);
    window.history.pushState({}, "", "?username=" + e.target.username.value);
  };

  const createRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 10).toUpperCase();
    setRoomId(newRoomId);
    setInputRoomId("");
    setShowJoinRoom(false);
  };

  const joinRoom = () => {
    if (inputRoomId.trim()) {
      setRoomId(inputRoomId.trim().toUpperCase());
      setInputRoomId("");
      setShowJoinRoom(false);
    }
  };

  const leaveRoom = () => {
    if (provider) {
      provider.disconnect();
      setProvider(null);
    }
    setRoomId("");
    setUsers([]);
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
  };

  useEffect(() => {
    if (username && roomId) {
      const newProvider = new SocketIOProvider(
        "http://localhost:3000",
        roomId,
        ydoc,
        {
          autoConnect: true,
        }
      );

      newProvider.awareness.setLocalStateField("user", { username, roomId });

      const states = Array.from(newProvider.awareness.getStates().values());

      setUsers(
        states
          .filter((state) => state.user && state.user.username)
          .map((state) => state.user),
      );

      newProvider.awareness.on("change", () => {
        const states = Array.from(newProvider.awareness.getStates().values());
        setUsers(
          states
            .filter((state) => state.user && state.user.username)
            .map((state) => state.user),
        );
      });

      function handleBeforeUnload() {
        newProvider.awareness.setLocalStateField("user", null);
      }

      window.addEventListener("beforeunload", handleBeforeUnload);
      setProvider(newProvider);

      return () => {
        newProvider.disconnect();
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }
  }, [username, roomId]);

  if (showWelcome) {
    return (
      <main className="flex justify-center items-center bg-black p-4 w-full h-screen min-h-screen">
        <div className="bg-gray-900 p-12 border border-gray-800 rounded-lg w-full max-w-4xl">
          <div className="mb-12 py-3 text-center">
            <h1 className="flex justify-center items-center gap-3 mb-4 font-bold text-white text-5xl">
              <SiCollaboraonline/> ExoticCode
            </h1>
            <p className="text-gray-400 text-xl">Real-time collaborative coding & drawing platform</p>
          </div>

          <div className="gap-6 grid md:grid-cols-3 mb-12">
            <div className="bg-gray-800 p-6 border border-gray-700 rounded-lg">
              <div className="mb-4 text-4xl">💻</div>
              <h3 className="mb-2 font-bold text-white text-lg">Code Editor</h3>
              <p className="text-gray-400 text-sm">Collaborative Monaco editor with syntax highlighting for multiple languages</p>
            </div>
            <div className="bg-gray-800 p-6 border border-gray-700 rounded-lg">
              <div className="mb-4 text-4xl">🎨</div>
              <h3 className="mb-2 font-bold text-white text-lg">Drawing Board</h3>
              <p className="text-gray-400 text-sm">Shared canvas for sketching diagrams, flowcharts, and visual collaboration</p>
            </div>
            <div className="bg-gray-800 p-6 border border-gray-700 rounded-lg">
              <div className="mb-4 text-4xl">⚡</div>
              <h3 className="mb-2 font-bold text-white text-lg">Real-time Sync</h3>
              <p className="text-gray-400 text-sm">Instant synchronization across all users in the room</p>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => setShowWelcome(false)}
              className="bg-white hover:bg-gray-200 active:bg-gray-300 shadow-lg px-8 py-4 rounded-lg w-full max-w-xs font-bold text-black hover:scale-105 active:scale-95 transition-all transform"
            >
              Get Started
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!username) {
    return (
      <main className="flex justify-center items-center bg-black p-4 w-full h-screen min-h-screen">
        <div className="bg-gray-900 shadow-2xl p-8 border border-gray-800 rounded-lg w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="flex justify-center items-center gap-2 mb-2 font-bold text-white text-4xl"><SiCollaboraonline/> ExoticCode</h1>
            <p className="text-gray-400">Real-time collaborative coding & drawing</p>
          </div>
          <form onSubmit={handleJoin} className="flex flex-col gap-4">
            <div>
              <label className="block mb-2 font-medium text-gray-300 text-sm">
                Enter your username
              </label>
              <input
                type="text"
                placeholder="e.g. JohnDoe"
                className="bg-gray-800 p-4 border border-gray-700 focus:border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 w-full text-white transition-all placeholder-gray-500"
                name="username"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-white hover:bg-gray-200 active:bg-gray-300 shadow-lg p-4 rounded-lg w-full font-bold text-black hover:scale-105 active:scale-95 transition-all transform"
            >
              Start Collaborating
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex gap-4 bg-black p-4 w-full h-screen">
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="z-40 fixed inset-0 bg-black/50"
        />
      )}
      <aside className={`flex flex-col bg-gray-900 shadow-2xl border border-gray-800 rounded-lg w-80 h-full absolute left-4 top-4 bottom-4 z-50 transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-13 border-gray-800 border-b">
          <h2 className="mb-1 px-3 font-bold text-white text-2xl">ExoticCode</h2>
          <p className="px-3 text-gray-400 text-sm">Welcome, {username}</p>
        </div>

        {!roomId ? (
          <div className="flex flex-col flex-1 gap-4 p-6">
            <div>
              <h3 className="mb-3 font-semibold text-white">Create or Join Room</h3>
              <button
                onClick={createRoom}
                className="bg-white hover:bg-gray-200 active:bg-gray-300 shadow-md mb-3 p-3 rounded-lg w-full font-semibold text-black hover:scale-105 active:scale-95 transition-all"
              >
                Generate Random Room ID
              </button>
              <button
                onClick={() => setShowJoinRoom(!showJoinRoom)}
                className="bg-gray-800 hover:bg-gray-700 active:bg-gray-600 shadow-md p-3 border border-gray-700 rounded-lg w-full font-semibold text-white hover:scale-105 active:scale-95 transition-all"
              >
                Join Existing Room
              </button>
            </div>
            {showJoinRoom && (
              <div>
                <input
                  type="text"
                  placeholder="Enter Room ID"
                  value={inputRoomId}
                  onChange={(e) => setInputRoomId(e.target.value.toUpperCase())}
                  className="flex-1 bg-gray-800 p-3 border border-gray-700 focus:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-white transition-all placeholder-gray-500"
                />
                <button
                  onClick={joinRoom}
                  className="bg-white hover:bg-gray-200 active:bg-gray-300 shadow-md px-4 py-2 py-3 rounded-lg font-bold text-black whitespace-nowrap hover:scale-105 active:scale-95 transition-all"
                >
                  Join
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="p-4 border-gray-800 border-b">
              <div className="bg-gray-800 p-4 rounded-lg">
                <p className="mb-1 text-gray-400 text-xs">Room ID</p>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-white text-xl">
                    {roomId}
                  </span>
                  <button
                    onClick={copyRoomId}
                    className="bg-gray-700 hover:bg-gray-600 active:bg-gray-500 p-2 rounded-lg hover:scale-110 active:scale-95 transition-all"
                    title="Copy Room ID"
                  >
                    📋
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 border-gray-800 border-b">
              <h3 className="mb-3 font-semibold text-white">Online Users ({users.length})</h3>
              <ul className="space-y-2 max-h-40 overflow-y-auto">
                {users.map((user, index) => (
                  <li
                    key={index}
                    className={`p-3 rounded-lg flex items-center gap-3 transition-all hover:scale-102 ${
                      user.username === username
                        ? "bg-gray-700 border border-gray-600"
                        : "bg-gray-800 hover:bg-gray-700"
                    }`}
                  >
                    <div className="flex justify-center items-center bg-gray-600 shadow-md rounded-full w-8 h-8 font-bold text-white text-sm">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-white">{user.username}</span>
                    {user.username === username && (
                      <span className="ml-auto text-gray-400 text-xs">(You)</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
                
            <div className="p-4 border-gray-800 border-b">
              <h3 className="mb-3 font-semibold text-white">Tools</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setCurrentView("editor")}
                  className={`w-full p-3 rounded-lg font-semibold transition-all flex items-center gap-3 hover:scale-105 active:scale-95 ${
                    currentView === "editor"
                      ? "bg-white text-black shadow-md"
                      : "bg-gray-800 text-white hover:bg-gray-700 border border-gray-700"
                  }`}
                >
                  <span>💻</span> Code Editor
                </button>
                <button
                  onClick={() => setCurrentView("drawing")}
                  className={`w-full p-3 rounded-lg font-semibold transition-all flex items-center gap-3 hover:scale-105 active:scale-95 ${
                    currentView === "drawing"
                      ? "bg-white text-black shadow-md"
                      : "bg-gray-800 text-white hover:bg-gray-700 border border-gray-700"
                  }`}
                >
                  <span>🎨</span> Drawing Board
                </button>
              </div>
            </div>

            <div className="mt-auto p-4">
              <button
                onClick={leaveRoom}
                className="bg-gray-800 hover:bg-gray-700 active:bg-gray-600 shadow-md p-3 border border-gray-700 rounded-lg w-full font-semibold text-white hover:scale-105 active:scale-95 transition-all"
              >
                Leave Room
              </button>
            </div>

          </>
        )}
      </aside>

      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="top-4 left-4 z-50 absolute bg-gray-900 hover:bg-gray-800 shadow-md p-3 border border-gray-700 rounded-lg text-white hover:scale-105 active:scale-95 transition-all"
        title="Toggle Sidebar"
      >
        {sidebarOpen ? '✕' : '☰'}
      </button>

      <section className="flex-2 bg-gray-900 shadow-2xl px-11 border border-gray-800 rounded-lg overflow-hidden">
        {!roomId ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-center">
              <div className="mb-4 text-6xl">🚀</div>
              <h2 className="mb-2 font-bold text-white text-2xl">
                Ready to Collaborate?
              </h2>
              <p className="text-gray-400">
                Create a room or join an existing one to start collaborating
              </p>
            </div>
          </div>
        ) : currentView === "editor" ? (
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-4 bg-gray-800 p-4 border-gray-700 border-b">
              <label className="font-medium text-white">Language:</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-gray-700 p-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 text-white"
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="json">JSON</option>
                <option value="markdown">Markdown</option>
              </select>
            </div>
            <Editor
              height="100%"
              language={language}
              defaultValue="// Start coding together!\n// All changes are synced in real-time"
              theme="vs-dark"
              onMount={handleMount}
              key={language}
            />
          </div>
        ) : (
          <DrawingBoard ydoc={ydoc} />
        )}
      </section>
    </main>
  );
}

export default App;
