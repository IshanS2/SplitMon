import { useState, useEffect } from "react";
import axios from "axios";

export default function App() {
  const [friends, setFriends] = useState([]);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);

  useEffect(() => {
    // Fetch friends from backend
    axios
      .get("http://localhost:5000/api/friends")
      .then((response) => setFriends(response.data))
      .catch((error) => console.log(error));
  }, []);

  function handleShowAddFriend() {
    setShowAddFriend((show) => !show);
  }

  function handleAddFriend(friend) {
    // POST request to add friend to backend
    axios
      .post("http://localhost:5000/api/friends", friend)
      .then((response) => setFriends([...friends, response.data]))
      .catch((error) => console.log(error));
    setShowAddFriend(false);
  }

  function handleSelection(friend) {
    setSelectedFriend((cur) => (cur?._id === friend._id ? null : friend));
    setShowAddFriend(false);
  }

  function handleSplitBill(value) {
    axios
      .put(`http://localhost:5000/api/friends/${selectedFriend._id}`, {
        balance: selectedFriend.balance + value,
      })
      .then((response) => {
        setFriends(
          friends.map((friend) =>
            friend._id === selectedFriend._id ? response.data : friend
          )
        );
        setSelectedFriend(null);
      })
      .catch((error) => console.log(error));
  }

  function handleDeleteFriend(id) {
    axios
      .delete(`http://localhost:5000/api/friends/${id}`)
      .then(() => {
        setFriends(friends.filter((friend) => friend._id !== id));
        setSelectedFriend(null); // Unselect the friend if they were selected
      })
      .catch((error) => console.log(error));
  }

  return (
    <>
      <h1 className="header">SPLITMON</h1>
      <div className="app">
        <div className="sidebar">
          <FriendsList
            friends={friends}
            onSelection={handleSelection}
            onDelete={handleDeleteFriend}
            selectedFriend={selectedFriend}
          />
          {showAddFriend && <FormAddFriend onAddFriend={handleAddFriend} />}
          <Button onClick={handleShowAddFriend}>
            {showAddFriend ? "Close" : "Add Friend"}
          </Button>
        </div>

        {selectedFriend && (
          <FormSplitBill
            selectedFriend={selectedFriend}
            onSplitBill={handleSplitBill}
          />
        )}
      </div>
    </>
  );
}

function FriendsList({ friends, onSelection, onDelete, selectedFriend }) {
  return (
    <ul>
      {friends.map((friend) => (
        <Friend
          friend={friend}
          key={friend._id}
          onSelection={onSelection}
          onDelete={onDelete}
          selectedFriend={selectedFriend}
        />
      ))}
    </ul>
  );
}

function Friend({ friend, onSelection, onDelete, selectedFriend }) {
  const isSelected = selectedFriend?._id === friend._id;

  return (
    <li className={isSelected ? "selected" : ""}>
      <img src={friend.image} alt={friend.name} />
      <h3>{friend.name}</h3>

      {friend.balance < 0 && (
        <p className="red">
          You owe {friend.name} {Math.abs(friend.balance)}$
        </p>
      )}
      {friend.balance > 0 && (
        <p className="green">
          {friend.name} owes You {Math.abs(friend.balance)}$
        </p>
      )}
      {friend.balance === 0 && <p>You and {friend.name} are Even</p>}

      {/* Align buttons side by side */}
      <div className="button-group">
        <Button onClick={() => onSelection(friend)}>
          {isSelected ? "Close" : "Select"}
        </Button>
        <Button onClick={() => onDelete(friend._id)}>Delete</Button>
      </div>
    </li>
  );
}

function FormAddFriend({ onAddFriend }) {
  const [name, setName] = useState("");
  const [image, setImage] = useState("https://i.pravatar.cc/48");

  function handleSubmit(e) {
    e.preventDefault();

    if (!name || !image) return;

    const id = crypto.randomUUID();
    const newFriend = {
      id,
      name,
      image: `${image}?=${id}`,
      balance: 0,
    };

    onAddFriend(newFriend);

    setName("");
    setImage("https://i.pravatar.cc/48");
  }

  return (
    <form className="form-add-friend" onSubmit={handleSubmit}>
      <span style={{ fontWeight: "bold" }}>Friend Name</span>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <span style={{ fontWeight: "bold" }}> Image Url</span>
      <input
        type="text"
        value={image}
        onChange={(e) => setImage(e.target.value)}
      />

      <Button>Add</Button>
    </form>
  );
}

function FormSplitBill({ selectedFriend, onSplitBill }) {
  const [bill, setBill] = useState("");
  const [paidByUser, setPaidByUser] = useState("");
  const paidByFriend = bill ? bill - paidByUser : "";
  const [whoIsPaying, setWhoIsPaying] = useState("user");

  function handleSubmit(e) {
    e.preventDefault();

    if (!bill || !paidByUser) return;
    onSplitBill(whoIsPaying === "user" ? paidByFriend : -paidByUser);
  }

  return (
    <form className="form-split-bill" onSubmit={handleSubmit}>
      <h2>Split a bill with {selectedFriend.name}</h2>

      <span style={{ fontWeight: "bold" }}>Bill value</span>
      <input
        type="text"
        value={bill}
        onChange={(e) => setBill(Number(e.target.value))}
      />

      <span style={{ fontWeight: "bold" }}>Your expense</span>
      <input
        type="text"
        value={paidByUser}
        onChange={(e) =>
          setPaidByUser(
            Number(e.target.value) > bill ? paidByUser : Number(e.target.value)
          )
        }
      />

      <span style={{ fontWeight: "bold" }}>
        {selectedFriend.name}'s Expense
      </span>
      <input type="text" disabled value={paidByFriend} />

      <span style={{ fontWeight: "bold" }}>Who is Paying the Bill?</span>
      <select
        value={whoIsPaying}
        onChange={(e) => setWhoIsPaying(e.target.value)}
      >
        <option value="user">You</option>
        <option value="friend">{selectedFriend.name}</option>
      </select>

      <Button>Split bill</Button>
    </form>
  );
}

function Button({ children, onClick }) {
  return (
    <button className="button" onClick={onClick}>
      {children}
    </button>
  );
}
