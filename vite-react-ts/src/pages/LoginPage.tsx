import { type FormEvent } from "react";
import {
  Avatar,
  Button,
  Box,
  Typography,
  Container,
  CssBaseline,
  Paper,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { signIn2 } from "../firebase/firebase";
import { useAppDispatch } from "../app/hooks";
import { login } from "../features/auth/authSlice";
import { getRole } from "../services/role/roleApi";

type RoleObj = { sys: string };

export default function LoginPage() {
  const dispatch = useAppDispatch();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const res = await signIn2();
    console.log(res);
    const newUser = res.user;
    if (newUser) {
      const email = newUser.email;
      const uid = newUser.uid;
      if (!email || !uid) {
        console.error("Missing user email or uid from Firebase login");
        return;
      }

      try {
        const roleResponse = await getRole(email, uid) as {
          result?: RoleObj | null;
        };
        const roleObj = roleResponse.result ?? null;
        dispatch(login({
          username: email,
          token: uid,
          role: roleObj?.sys ?? "",
          roleObj,
        }));
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Failed to get role:", error.message);
        } else {
          console.error("Failed to get role", error);
        }
      }
    } else {
      console.error("login fail");
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Paper
        elevation={6}
        sx={{ mt: 8, p: 4, borderRadius: 3, textAlign: "center" }}
      >
        <Avatar sx={{ m: "auto", bgcolor: "secondary.main" }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5" sx={{ mt: 2 }}>
          Đăng nhập
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Đăng nhập với Google
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
