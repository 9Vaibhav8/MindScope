
export const fetchUserChats = async (token) => {
  try {
    const response = await fetch('http://localhost:8000/api/chats', {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    return await response.json();
  } catch (err) {
    console.error('Error fetching chats:', err);
    return [];
  }
};

// 🔹 Save a new chat (POST)
export const saveUserChat = async (token, chatData) => {
  try {
    const response = await fetch('http://localhost:8000/api/chats', {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(chatData),
    });

    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    return await response.json(); // returns the saved chat from MongoDB
  } catch (err) {
    console.error('Error saving chat:', err);
    return null;
  }
};


export const updateUserChat = async (token, chatId, updatedMessages) => {
  try {
    const response = await fetch(`http://localhost:8000/api/chats/${chatId}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages: updatedMessages }),
    });

    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    return await response.json();
  } catch (err) {
    console.error('Error updating chat:', err);
    return null;
  }
};
