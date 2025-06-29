import bcrypt from 'bcrypt';

async function createPasswordHash() {
  const password = 'EmbedTest2025!';
  const saltRounds = 10;
  
  try {
    const hash = await bcrypt.hash(password, saltRounds);
    console.log('Password:', password);
    console.log('Hash:', hash);
    return hash;
  } catch (error) {
    console.error('Error creating hash:', error);
  }
}

createPasswordHash();