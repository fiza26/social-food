import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useUserStore } from '../stores/userSession'

import supabase from "@/supabase"

export const usePostsStore = defineStore('postsStore', {
    state: () => ({
        posts: [],
        notif: false,
        messageNotif: ''
    }),
    actions: {
        async getPosts() {
            const { data } = await supabase.from('posts').select()

            this.posts = data.map(post => {
                // Initialize additional properties for each post
                post.isUpvoted = false;
                post.settingState = false;
                post.editPostActive = false;
                post.isSaved = false;
                return post;
            });

            // Get the user store inside the action
            const userStore = useUserStore();

            // Check if the user has upvoted each post
            for (const post of this.posts) {
                const { data: upvotes } = await supabase
                    .from('upvotes')
                    .select()
                    .eq('id_post', post.id)
                    .eq('name', userStore.name); // Use the name from the user store

                if (upvotes.length > 0) {
                    post.isUpvoted = true;
                }
            }

            // Check if the user has saved each post
            for (const post of this.posts) {
                const { data: saved_post } = await supabase
                    .from('saved_post')
                    .select()
                    .eq('id_post', post.id)
                    .eq('saved_by', userStore.name); // Use the name from the user store

                if (saved_post.length > 0) {
                    post.isSaved = true;
                }
            }
        },
        async getMyPost() {
            const userStore = useUserStore();

            const { data } = await supabase.from('posts').select().eq('name', userStore.name);
            this.myPost = data;
        },
        editPost(post) {
            post.editPostActive = !post.editPostActive;
        },
        cancelEdit(post) {
            post.editPostActive = false;
        },
        async submitEdit(post) {
            if (post.post_content.length > 0) {
                const { error } = await supabase.from('posts').update({ post_content: post.post_content }).eq('id', post.id);
                this.notif = true;
                this.messageNotif = 'Post has been updated';
                await this.getPosts();
            } else {
                window.alert("Field can not be empty");
            }
        },
        async deletePost(post, route) {
            await supabase.from('posts').delete().eq('id', post.id);
            await supabase.from('upvotes').delete().eq('id_post', post.id);
            await supabase.from('comments').delete().eq('id_post', post.id);
            await supabase.from('saved_post').delete().eq('id_post', post.id);
            this.notif = true;
            this.messageNotif = 'Selected post has been deleted';
            await this.getPosts();

            if (route.name === 'comment') {
                history.go(-1);
            }
        },
        async upvote(post) {
            const userStore = useUserStore();

            // Increment local upvote count
            post.upvotes++;

            // Update upvote count in Supabase
            await supabase.from('posts').update({ upvotes: post.upvotes }).eq('id', post.id);
            // Update the 'upvotes' table to indicate the user has upvoted this post
            await supabase.from('upvotes').insert({ id_post: post.id, name: userStore.name, upvote: 'Yes' });

            // Update isUpvoted status for the post
            post.isUpvoted = true;
        },
        async removeUpvote(post) {
            const userStore = useUserStore();

            // Decrement local upvote count
            post.upvotes--;

            // Update upvote count in Supabase
            await supabase.from('posts').update({ upvotes: post.upvotes }).eq('id', post.id);
            // Remove the upvote record from the 'upvotes' table
            await supabase.from('upvotes').delete().eq('id_post', post.id).eq('name', userStore.name);

            // Update isUpvoted status for the post
            post.isUpvoted = false;
        },
        async savePost(post) {
            const userStore = useUserStore();

            const savedPost = ref([]);

            savedPost.value = [{
                postId: post.id,
                postName: post.name,
                postContent: post.post_content,
                postImageUrl: post.image_url,
                postUpvotes: post.upvotes,
                postDateCreated: post.date_created,
                postLabel: post.label,
                postTotalComments: post.total_comments,
                postSavedBy: userStore.name,
            }]

            const { error } = await supabase.from('saved_post').insert({
                id_post: savedPost.value[0].postId,
                name: savedPost.value[0].postName,
                post_content: savedPost.value[0].postContent,
                image_url: savedPost.value[0].postImageUrl,
                upvotes: savedPost.value[0].postUpvotes,
                date_created: savedPost.value[0].postDateCreated,
                label: savedPost.value[0].postLabel,
                total_comments: savedPost.value[0].postTotalComments,
                saved_by: savedPost.value[0].postSavedBy,
            })

            if (error) {
                console.log("Error occured", error);
            } else {
                post.isSaved = true;
            }
        },
        async removeSavedPost(post) {
            const userStore = useUserStore();

            await supabase.from('saved_post').delete().eq('id_post', post.id).eq('saved_by', userStore.name);
            post.isSaved = false;
        },
        async removeSavedPostAlternative(post) {
            const userStore = useUserStore();

            await supabase.from('saved_post').delete().eq('id_post', post.id_post).eq('saved_by', userStore.name);
            post.isSaved = false;
            location.reload()
        }
    }
});
