const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://uustktapnkmmbvzcpdxn.supabase.co';
const supabaseKey = 'sb_publishable_cDmyKeNgWnLcocdXLt9Z-Q_2INoo6i0'; // Anon Key from .env.local

const supabase = createClient(supabaseUrl, supabaseKey);

async function login() {
    console.log("Attempting Login...");
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'ahmed.test@gmail.com',
        password: 'password123',
    });

    if (!error && data.session) {
        console.log('Login Successful');
        console.log('Access Token:', data.session.access_token);
        console.log('User ID:', data.user.id);
        return;
    }

    console.log('Login failed:', error?.message);

    console.log("Attempting Sign Up...");
    const { data: upData, error: upError } = await supabase.auth.signUp({
        email: 'ahmed.test@gmail.com',
        password: 'password123',
    });

    if (upError) {
        console.log('Sign Up failed:', upError.message);
        return;
    }

    if (upData.session) {
        console.log('Signed Up Successfully');
        console.log('Access Token:', upData.session.access_token);
        console.log('User ID:', upData.user.id);
    } else {
        console.log('Signed up, check email to confirm (or disable confirm via dashboard). Data:', upData);
        console.log('User ID (New):', upData.user?.id);
    }
}

login();
