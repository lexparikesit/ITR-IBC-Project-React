'use client';

import { useState } from "react";
import {
     TextInput,
     PasswordInput,
     Checkbox,
     Paper,
     Title,
     Container,
     Button,
     Group,
     Anchor,
     Stack,
     Center,
     Text
} from '@mantine/core';

export default function LoginPage() {
     const [username, setUsername] = useState('');
     const [password, setPassword] = useState('');
     const [remember, setRemember] = useState(false);

     const handleLogin = async () => {
     try {
          const response = await fetch('http://localhost:5000/api/login', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ username, password, remember }),
          });
          
          const data = await response.json();
          console.log(data);

          if (response.ok) {
               alert('Login Successfully!');
          } else {
               alert(data.message || 'Login Failed!');
          }
     } catch(error){
          console.error('Login error:', error);
     }
};

return (
     <div className="min-h-screen bg-gradient-to-r from-blue-200 to-purple-200 flex items-center justify-center">
          <Container size={600} my={40}>
               <Paper withBorder shadow="md" p={30} mt={30} radius="md" className="w-full max-w-md bg-white">
                    <Title align="center" mb="md">Login User</Title>
                    <Stack>
                         
                         <TextInput
                              label="Username"
                              placeholder="username"
                              value={username}
                              onChange={(e) => setUsername(e.currentTarget.value)}
                              required
                         />
                         
                         <PasswordInput
                              label="Password"
                              placeholder="••••••••"
                              value={password}
                              onChange={(e) => setPassword(e.currentTarget.value)}
                              required
                              mt="md"
                         />
                         
                         <Group position="apart" mt="xs">
                              <Checkbox
                                   label="Remember Me"
                                   checked={remember}
                                   onChange={(e) => setRemember(e.currentTarget.checked)}
                              />
                              <Anchor href="#" size="sm"> Forget Password </Anchor>
                         </Group>
                         
                         <Button fullWidth mt="xl" onClick={handleLogin}>
                              Login
                         </Button>
                    </Stack>

                    <Center mt="xl" style={{ flexDirection: 'column' }}>
                         <Text>Don't have an account?</Text>
                         <Anchor href="/register" size="sm">Sign up Here!</Anchor>
                    </Center>
               </Paper>
          </Container>
     </div>
     );
}
