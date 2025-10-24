import React, { use, useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { addUser, editUser, selectUsers, setAllUsers, deleteUser } from "../features/user/userSlice";
import { useDispatch, useSelector } from "react-redux";
import { createUser, getAllUsers, removeUser, updateUser } from "../services/user/userApi";
import { createRole, getRole, removeRole, updateRole } from "../services/role/roleApi";

export default function UserManager() {
  const dispatch = useDispatch();
  const users = useSelector(selectUsers)
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ name: "", email: "" });

  useEffect(() => {
    async function loadUsers() {
      // Placeholder for loading users if needed
      var {result:users} = await getAllUsers();
      if (users) {
        // Dispatch action to load users into Redux store
        dispatch(setAllUsers({users}));
      }
    }
    // Load users if needed
    loadUsers();
  }, [dispatch]);

  const email = editingUser ? editingUser.email : "";
  useEffect(() => {
    async function fetchRole() {
      if (email) {
        var { result: roleObj } = await getRole(email);
        if (roleObj) {
          var role = roleObj.titles ? roleObj.titles : "";
          setForm((prevForm) => ({ ...prevForm, role }));
        }
      }
    }
    fetchRole();
  }, [email]);

  const handleOpen = (user = null) => {
    setEditingUser(user);
    setForm(user ? { name: user.name, email: user.email, role: ""} : { name: "", email: "", role: "" });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingUser(null);
  };

  const handleSave = async () => {
    if (editingUser) {
      // update role
      if (form.role !== editingUser.role) {
        if (form.email === editingUser.email){
          var roleObj = { titles: form.role, keys: form.role };
          var {result} = await updateRole(editingUser.email, roleObj);
          console.log("Role updated:", result);
        }
      }

      if (form.email !== editingUser.email) {
        // delete old role
        var {result} = await removeRole(editingUser.email);
        console.log("Old role removed:", result);
        // create new role
        if (form.role !== "") {
          var roleObj = { id: form.email, titles: form.role, keys: form.role };
          var {result} = await createRole(roleObj);
          console.log("New role created:", result);
        }
      }

      // Update user info
      var id = editingUser.id;
      var changes = {};
      ["name", "email"].forEach((field) => {
        if (form[field] !== editingUser[field]) {
          changes[field] = form[field];
        }
      });      
      if (Object.keys(changes).length !== 0) {
        var {result} = await updateUser(id, changes);
        if (result) {
          dispatch(editUser({ id, changes }));
        }
      }
    } else {
      // Add role
      if (form.role !== "" && form.email !== "") {
        var roleObj = { id: form.email, titles: form.role, keys: form.role };
        var {result} = await createRole(roleObj);
      }

      // Create
      var newUser = { email: form.email, name: form.name };
      var {result} = await createUser(newUser);
      if (result) {
        dispatch(addUser({user:result}));
      }
    }
    handleClose();
  };

  const handleDelete = async (id) => {
    // remove user
    var {result} = await removeUser(id);
    if (result) {
      console.log("User removed:", result);

      // remove role
      if (result.email) {
        var {result} = await removeRole(result.email);
        console.log("Role removed:", result);
      }

      dispatch(deleteUser({ userId: id }) );
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        User Management
      </Typography>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => handleOpen()}
        sx={{ mb: 2 }}
      >
        Add User
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {/* <TableCell><b>ID</b></TableCell> */}
              <TableCell>
                <b>Name</b>
              </TableCell>
              <TableCell>
                <b>Email</b>
              </TableCell>
              <TableCell>
                <b>Actions</b>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                {/* <TableCell>{user.id}</TableCell> */}
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleOpen(user)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(user.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog for Add/Edit */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editingUser ? "Edit User" : "Add User"}</DialogTitle>
        <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Name"
              fullWidth
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Email"
              type="email"
              fullWidth
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <FormControl 
                sx = {{mt:1}}
                fullWidth>
              <InputLabel id="role-label">Role</InputLabel>
              <Select
                labelId="role-label"
                margin="dense"
                label="Role"
                value={form.role?form.role:""}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value="read">Read</MenuItem>
                <MenuItem value="write">Write</MenuItem>
              </Select>
            </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {editingUser ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
