import React, { useEffect, useState } from 'react';
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import axios from "axios";
import Footer from './common/Footer';

function Blogs() {

    const [blogs, setBlogs] = useState([]);

    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');

    const [isAdmin, setIsAdmin] = useState(false);

    // Edit states
    const [editingBlogId, setEditingBlogId] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');

    // Check Admin User
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setIsAdmin(user?.uid === "bihTBFdFJAU8ESrKqk0bNWtLi9z1");
        });

        return () => unsubscribe();
    }, []);

    // Fetch all blogs
    const fetchBlogs = async () => {
        try {
            const res = await axios.get(
                "http://localhost:5000/api/blogs"
            );

            setBlogs(res.data);

        } catch (error) {
            console.log("Error fetching blogs:", error);
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchBlogs();
    }, []);

    // Like Blog
    const handleLike = async (blog_id) => {
        try {
            await axios.patch(
                `http://localhost:5000/api/blogs/like/${blog_id}`
            );

            fetchBlogs();

        } catch (error) {
            console.error("Error liking blog:", error);
        }
    };

    // Add Blog - Admin Only
    const handleNewBlogSubmit = async (event) => {
        event.preventDefault();

        try {
            const user = auth.currentUser;

            if (!user) {
                alert("Please login first!");
                return;
            }

            const token = await user.getIdToken();

            const today = new Date();

            const date = today.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            const response = await axios.post(
                "http://localhost:5000/api/blogs",
                {
                    newTitle,
                    date,
                    newContent,
                    likes: 0
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.status === 201) {
                alert("Blog added successfully!");

                setNewTitle('');
                setNewContent('');

                fetchBlogs();
            }

        } catch (error) {
            console.error("Error adding blog:", error);

            alert(
                error.response?.data?.message ||
                "Failed to add blog"
            );
        }
    };

    // Start Editing Blog
    const handleEditClick = (blog) => {
        setEditingBlogId(blog._id);
        setEditTitle(blog.newTitle);
        setEditContent(blog.newContent);
    };

    // Update Blog - Admin Only
    const handleUpdateBlog = async (blog_id) => {
        try {
            const user = auth.currentUser;

            if (!user) {
                alert("Please login first!");
                return;
            }

            const token = await user.getIdToken();

            const response = await axios.patch(
                `http://localhost:5000/api/blogs/${blog_id}`,
                {
                    newTitle: editTitle,
                    newContent: editContent
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.status === 200) {
                alert("Blog updated successfully!");

                setEditingBlogId(null);
                setEditTitle('');
                setEditContent('');

                fetchBlogs();
            }

        } catch (error) {
            console.error("Error updating blog:", error);

            alert(
                error.response?.data?.message ||
                "Failed to update blog"
            );
        }
    };

    // Cancel Editing
    const handleCancelEdit = () => {
        setEditingBlogId(null);
        setEditTitle('');
        setEditContent('');
    };

    // Delete Blog - Admin Only
    const handleDeleteBlog = async (blog_id) => {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this blog?"
        );

        if (!confirmDelete) {
            return;
        }

        try {
            const user = auth.currentUser;

            if (!user) {
                alert("Please login first!");
                return;
            }

            const token = await user.getIdToken();

            const response = await axios.delete(
                `http://localhost:5000/api/blogs/${blog_id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.status === 200) {
                alert("Blog deleted successfully!");

                fetchBlogs();
            }

        } catch (error) {
            console.error("Error deleting blog:", error);

            alert(
                error.response?.data?.message ||
                "Failed to delete blog"
            );
        }
    };

    return (
        <div className="blog-section py-14">

            <h2 className="text-center text-5xl font-bold mb-14">
                Latest <span className='text-orange-400'>Blogs</span> 📚
            </h2>

            {/* Add Blog Form - Admin Only */}
            {isAdmin && (
                <div
                    className="blog-creation-form mb-8"
                    style={{ width: "80%", margin: "auto" }}
                >
                    <form
                        onSubmit={handleNewBlogSubmit}
                        className="flex flex-col gap-4"
                    >

                        <h3 className="text-2xl font-bold">
                            Add New Blog
                        </h3>

                        <input
                            type="text"
                            placeholder="Blog Title"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="p-2 border rounded"
                            required
                        />

                        <textarea
                            placeholder="Blog Content"
                            value={newContent}
                            onChange={(e) => setNewContent(e.target.value)}
                            className="p-2 border rounded"
                            rows="4"
                            required
                        />

                        <button
                            type="submit"
                            className="bg-orange-400 text-white p-2 rounded hover:bg-orange-600"
                        >
                            Add Blog
                        </button>

                    </form>
                </div>
            )}

            {/* Display Blogs */}
            <div className="blogs-container grid grid-cols-1 md:grid-cols-2 gap-6 container mx-auto px-4">

                {blogs.map((blog) => (

                    <div
                        key={blog._id}
                        className="blog-post mb-8 p-6 bg-white shadow-lg rounded-lg"
                    >

                        {editingBlogId === blog._id ? (

                            // Edit Form
                            <div className="flex flex-col gap-4">

                                <h3 className="text-xl font-bold">
                                    Edit Blog
                                </h3>

                                <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) =>
                                        setEditTitle(e.target.value)
                                    }
                                    className="p-2 border rounded"
                                    placeholder="Blog Title"
                                    required
                                />

                                <textarea
                                    value={editContent}
                                    onChange={(e) =>
                                        setEditContent(e.target.value)
                                    }
                                    className="p-2 border rounded"
                                    rows="4"
                                    placeholder="Blog Content"
                                    required
                                />

                                <button
                                    onClick={() => handleUpdateBlog(blog._id)}
                                    className="bg-green-500 text-white p-2 rounded hover:bg-green-700"
                                >
                                    Save Changes
                                </button>

                                <button
                                    onClick={handleCancelEdit}
                                    className="bg-gray-500 text-white p-2 rounded hover:bg-gray-700"
                                >
                                    Cancel
                                </button>

                            </div>

                        ) : (

                            // Normal Blog Display
                            <>

                                <h3 className="blog-title font-semibold text-2xl text-gray-800 mb-3">
                                    {blog.newTitle}
                                </h3>

                                <p className="blog-date text-gray-400 text-sm mb-4">
                                    {blog.date}
                                </p>

                                <p className="blog-content text-gray-600 mb-4">
                                    {blog.newContent}
                                </p>

                                <div className="flex items-center gap-3">

                                    <button
                                        className="text-blue-500 cursor-pointer"
                                        onClick={() => handleLike(blog._id)}
                                    >
                                        Like
                                    </button>

                                    <span>
                                        {blog.likes} Likes
                                    </span>

                                </div>

                                {/* Admin Edit and Delete Buttons */}
                                {isAdmin && (
                                    <div className="flex gap-3 mt-4">

                                        <button
                                            onClick={() => handleEditClick(blog)}
                                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => handleDeleteBlog(blog._id)}
                                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
                                        >
                                            Delete
                                        </button>

                                    </div>
                                )}

                            </>
                        )}

                    </div>

                ))}

            </div>

            <Footer />

        </div>
    );
}

export default Blogs;