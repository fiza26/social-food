import { defineStore } from 'pinia'

import supabase from "@/supabase"

export const useUserStore = defineStore('userStore', {
    state: () => ({
        localUser: null,
        show: true,
        name: '',
        fullName: '',
        userProfile: [],
        myProfilePicture: null
    }),
    actions: {
        async isLoggedIn() {
            this.localUser = await supabase.auth.getSession();
            this.name = this.localUser.data.session.user.user_metadata.username;
            this.fullName = this.localUser.data.session.user.user_metadata.full_name;
            if (this.localUser.data.session) {
                this.show = false;
            }
        },
        async getProfile() {
            if (!this.name) return;
            const { data, error } = await supabase
                .from('profiles')
                .select()
                .eq('name', this.name);

            if (error) {
                console.error('Error fetching profile:', error.message);
                return;
            }
            this.userProfile = data;

            if (this.userProfile.length > 0) {
                this.myProfilePicture = this.userProfile[0].profile_picture_url;
            } else {
                this.myProfilePicture = null;
            }
        }
    }
});