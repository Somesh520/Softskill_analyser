import mongoose from "mongoose";



const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            maxPoolSize: 500,
            minPoolSize: 10
        });
        console.log("MongoDB connected successfully");
    }
    catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    }
}

export default connectDB;