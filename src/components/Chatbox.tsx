import { useEffect, useState } from "react";
import { sendMessageToOSKY } from "@/services/api";

export default function ChatBox() {
  const [reply, setReply] = useState<string>("");

  useEffect(() => {
    const fetchReply = async () => {
      const res = await sendMessageToOSKY("Hello OSKY");
      setReply(res.reply);
    };
    fetchReply();
  }, []);

  return (
    <div className="p-4 text-white bg-gray-900 rounded-lg shadow-lg">
      <p className="font-bold">OSKY:</p>
      <p>{reply}</p>
    </div>
  );
}
