import { User } from "../models/User.model.js";
import { Webhook } from "svix";

const clerkWebHooks = async (req, res) => {
  try {
    // 1. Get the raw body buffer from the request (made available by express.raw() in server.js)
    const rawBody = req.body.toString();

    // Create a Svix instance with clerk webhook secret
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    // Getting Headers
    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    };

    // 2. Verifying Headers using the RAW body.
    // The verify method returns the parsed payload if successful.
    const payload = await whook.verify(rawBody, headers);

    // 3. Getting Data from the verified payload
    const { data, type } = payload;

    // Safety check for username construction
    const username =
      data.first_name && data.last_name
        ? `${data.first_name} ${data.last_name}`
        : data.username || data.id; // Use data.id as final fallback

    const userData = {
      _id: data.id,
      email: data.email_addresses[0].email_address,
      username: username,
      image: data.image_url,
      recentSearchedCities: [], // Correctly initialized for the required array field
    };

    // Switch Cases for different events
    switch (type) {
      case "user.created":
        console.log(
          "Webhook user.created received. Attempting to save user:",
          userData.email
        );
        await User.create(userData);
        console.log("User saved successfully.");
        break;
      case "user.updated":
        console.log(
          "Webhook user.updated received. Attempting to update user:",
          userData.email
        );
        await User.findByIdAndUpdate(data.id, userData);
        console.log("User updated successfully.");
        break;
      case "user.deleted":
        console.log(
          "Webhook user.deleted received. Attempting to delete user:",
          data.id
        );
        await User.findByIdAndDelete(data.id);
        console.log("User deleted successfully.");
        break;
      default:
        // Handle unexpected event types
        console.log(`Unhandled event type: ${type}`);
        break;
    }

    // Respond with success status (200)
    res.status(200).json({ success: true, message: "Webhook Received" });
  } catch (error) {
    // Log the error and respond with a non-200 status to tell Clerk the webhook failed
    console.error("Clerk Webhook Error:", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

export default clerkWebHooks;
