<?php

namespace App\Http\Livewire\Telegram;

use App\Models\Telegram;
use Exception;
use Illuminate\Database\QueryException;
use Livewire\Component;

class Telegrams extends Component
{
    public $storeTelegramForm, $destroyTelegramForm, $storedTelegram;

    public function mount(){
        $this->setDefaultValues();
        $this->getStoredTelegram();

    }


    public function render(){
        return view('livewire.telegram.telegrams');
    }

    /**
     * Only one telegram bot can be stored
     */
    public function storeTelegram(){
        $this->validate([
            'storeTelegramForm.bot_token' => [
                'required',
                'string',
                'max:255',
            ],
            'storeTelegramForm.chat_id' => [
                'required',
                'string',
                'max:255',
            ],
        ]);
        $this->resetValidation();

        try{
            // check if already are an stored telegram bot
            if($this->storedTelegram !== null){
                $this->storedTelegram->chat_id = $this->storeTelegramForm['chat_id'];
                $this->storedTelegram->bot_token = $this->storeTelegramForm['bot_token'];
                $this->storedTelegram->save();
                $this->emit('telegramUpdated');
            }else{
                $telegram = new Telegram;
                $telegram->chat_id = $this->storeTelegramForm['chat_id'];
                $telegram->bot_token = $this->storeTelegramForm['bot_token'];
                $telegram->save();
                $this->emit('telegramStored');

            }
        }catch(QueryException $error){
            return $this->addError('storeTelegram', 'Database error');

        }catch(Exception $error){
            return $this->addError('storeTelegram', 'Server Error');

        }

        $this->setDefaultValues();
        $this->getStoredTelegram();

    }

    /**
     * Set the default values to variable form
     */
    private function setDefaultValues(){
        $this->fill([
            'storeTelegramForm' => [
                'bot_token' => '',
                'chat_id' => '',
            ],
            'destroyTelegramForm' => [
                'id' => '',
            ]
        ]);
    }

    private function getStoredTelegram(){
        $this->storedTelegram = Telegram::first();
        return $this->storedTelegram;
    }

    /**
     * Destroy the stored telegram bot
     */
    public function destroyTelegram(){
        $this->validate([
            'destroyTelegramForm.id' => [
                'required',
                'integer',
                'exists:telegrams,id'
            ],
        ]);
        $this->resetValidation();

        try{
            $telegram = Telegram::find($this->destroyTelegramForm['id']);
            $telegram->delete();
        }catch(QueryException){
            return $this->addError('destroyTelegram', 'Database error');

        }catch(Exception){
            return $this->addError('destroyTelegram', 'Server Error');

        }

        $this->emit('telegramDestroyed');
        $this->setDefaultValues();
        $this->getStoredTelegram();
    }


}
