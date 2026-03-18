<script>
    import { game } from "../../../store/game";
    import { supabase } from "../../../lib/supabase";
    import Button from "../Game/Button.svelte";

    let session = $state(null);

    $effect(() => {
        supabase.auth.getSession().then(({ data }) => {
            session = data.session;
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, _session) => {
            session = _session;
        });

        return () => subscription.unsubscribe();
    });
</script>

{#if session}
    <div class="user-info">
        <Button onClick={game.logout} size="lg">
            <img src="/img/icons/google.png" alt="google logo" class="icon-google" />
            Logout
        </Button>
        <span class="user-email">{session.user.email}</span>
    </div>
{:else}
    <Button onClick={game.login} size="lg">
        <img src="/img/icons/google.png" alt="google logo" class="icon-google" />
        Login
    </Button>
{/if}

<style>
    .user-info {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .user-email {
        font-size: 1.2rem;
    }

    .icon-google {
        margin-right: 10px;
        width: 20px;
        height: 20px;
    }
</style>