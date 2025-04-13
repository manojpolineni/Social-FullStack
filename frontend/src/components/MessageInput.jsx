import { useState } from "react";
import PropTypes from "prop-types";
import { Paperclip, SendHorizontal, Smile, XCircle } from "lucide-react";
import EmojiPicker from "emoji-picker-react";

const MessageInput = ({ onSendMessage, chatId, senderId }) => {
  const [message, setMessage] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  // const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);


  const handleEmojiSelect = (emoji) => {
    setMessage((prev) => (prev ? prev + emoji.emoji : emoji.emoji));
    setShowPicker(false);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      // setFile(selectedFile);
      setFileUrl(URL.createObjectURL(selectedFile));
    }
    else {
      alert('Only image files are allowed!');
    }
  }

  const handleSend = () => {
    if (!chatId) {
      console.error("❌ Cannot send message: chatId is null!");
      return;
    }
    
    const messageType = "text";
    console.log("sending message", { chatId, message, senderId, messageType, fileUrl });

    // const formData = new FormData();
    // formData.append("chatId", chatId);
    // formData.append("senderId", senderId);
    // const messageType ="text";
    // formData.append("messageType", messageType);
    // formData.append("messageType", messageType);
    // // if (file) formData.append("file", file);

    // for (let pair of formData.entries()) {
    //   console.log(`${pair[0]}: ${pair[1]}`);
    // }

    onSendMessage({
      chatId,
      senderId:{ _id: senderId },
      message,
      messageType: "text",
      fileUrl: "",
    });
    // console.log("Sending message:", );

    // onSendMessage();
    setMessage("");
    // setFile(null);
    setFileUrl(null);
  };

  return (
    <div className="p-3  flex items-center gap-2 relative">
      <div className="flex-1 relative border border-gray-300 rounded-full">
        <input
          className={`w-full p-3 rounded-full pl-20 pr-16 focus:outline-none `}
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              handleSend();
            }
          }}
        />
        <button
          className="absolute left-2 top-1/2 cursor-pointer transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          onClick={() => setShowPicker(!showPicker)}
        >
          <Smile size={25} />
        </button>
        <label className="cursor-pointer absolute bottom-3.5 left-11">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <Paperclip size={22} className="text-gray-600 hover:text-gray-800" />
        </label>

        {/* Emoji Picker */}
        {showPicker && (
          <div className="absolute bottom-14 left-3  border text-2xl shadow-lg z-50">
            <EmojiPicker onEmojiClick={handleEmojiSelect} />
          </div>
        )}
      </div>
      {fileUrl && (
        <div className="relative">
          <img
            src={fileUrl}
            alt="Preview"
            className="w-12 h-12 rounded-lg"
          />
          <button
            className="absolute -top-2 -right-2 text-red-500 rounded-full"
            onClick={() => {
              // setFile(null);
              setFileUrl(null);
            }}
          >
            <XCircle size={18} />
          </button>
        </div>
      )}
      {(message?.length > 0 || fileUrl) && (
        <button
          onClick={handleSend}
          className="bg-blue-600 hover:bg-blue-700 p-3 cursor-pointer rounded-full flex items-center justify-center transition ease-in-out duration-700"
        >
          <SendHorizontal size={24} />
        </button>
      )}
    </div>
  );
};
MessageInput.propTypes = {
  onSendMessage: PropTypes.func.isRequired,
  chatId: PropTypes.string.isRequired,
  senderId: PropTypes.string.isRequired,
  messageType: PropTypes.string,
};

export default MessageInput;
