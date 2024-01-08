<?php

namespace App\Http\Livewire\Discord;

use Livewire\Component;

class Discords extends Component
{
    public $storeDiscordForm;

    public function render()
    {
        return view('livewire.discord.discords');
    }
}
