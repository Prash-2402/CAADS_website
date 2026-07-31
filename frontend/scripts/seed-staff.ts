import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim();
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing env variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("Fetching existing profiles to find user IDs...");
  const { data: profiles, error: listError } = await supabase.from("profiles").select("id");
  if (listError) throw listError;

  console.log(`Found ${profiles.length} profiles. Deleting associated users...`);
  
  for (const profile of profiles) {
    await supabase.auth.admin.deleteUser(profile.id);
  }
  
  // Wipe remaining profiles just in case
  await supabase.from("profiles").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  console.log("Deleted all users and profiles.");

  const staffToCreate = [
    {
      email: "admin@gmail.com",
      password: "Password123!",
      user_metadata: {
        full_name: "Admin User",
        reg_no: "1111111",
        assigned_role: "admin",
      },
    },
    {
      email: "coreteam@gmail.com",
      password: "Password123!",
      user_metadata: {
        full_name: "Core Team Lead",
        reg_no: "2402001",
        assigned_role: "core_team",
      },
    },
    {
      email: "vol1@gmail.com",
      password: "Password123!",
      user_metadata: {
        full_name: "Volunteer One",
        reg_no: "2402111",
        assigned_role: "volunteer",
      },
    },
    {
      email: "vol2@gmail.com",
      password: "Password123!",
      user_metadata: {
        full_name: "Volunteer Two",
        reg_no: "2402222",
        assigned_role: "volunteer",
      },
    },
  ];

  console.log("Creating sample staff accounts...");
  for (const staff of staffToCreate) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: staff.email,
      password: staff.password,
      email_confirm: true,
      user_metadata: staff.user_metadata,
    });
    if (error) {
      console.error(`Error creating ${staff.email}:`, error.message);
    } else {
      console.log(`Created ${staff.email} (${staff.user_metadata.assigned_role})`);
    }
  }

  console.log("Done!");
}

main().catch(console.error);
