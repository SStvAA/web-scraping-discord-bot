<x-slot name="header">
    <h2 class="font-semibold text-xl text-gray-800 leading-tight">
        Telegram
    </h2>
</x-slot>

{{-- start here --}}
<div class="w-full">
    <x-jet-form-section submit="storeTelegram">
        <x-slot name="title">
            Información de Telegram
        </x-slot>

        <x-slot name="description">
            Asegúrese de que la información de su cuenta de Telegram está actualizada.
            Solo puede utilizarse un Bot para los avisos de Telegram.
        </x-slot>

        <x-slot name="form">
            <div class="col-span-3">
                <x-jet-label for="bot_token" value="Token de inicio de sesión" />
                <x-jet-input id="bot_token" class="block mt-1 w-full" type="text" name="bot_token" wire:model.defer="storeTelegramForm.bot_token"
                    required autocomplete="off" />
                <x-jet-input-error for="storeTelegramForm.bot_token" class="mt-2" />
            </div>
            <div class="col-span-3">
                <x-jet-label for="chat_id" value="ID del chat" />
                <x-jet-input id="chat_id" class="block mt-1 w-full" type="text" name="chat_id" wire:model.defer="storeTelegramForm.chat_id"
                    required autocomplete="off" />
                <x-jet-input-error for="storeTelegramForm.chat_id" class="mt-2" />
            </div>
        </x-slot>

        <x-slot name="actions">
            @error('storeTelegram')
            <x-action-error-message :message="$message" />
            @enderror

            <x-jet-action-message class="mr-3" on="telegramStored">
                Guardado.
            </x-jet-action-message>

            <x-jet-action-message class="mr-3" on="telegramUpdated">
                Actualizado.
            </x-jet-action-message>

            <x-jet-button>
                @if($storedTelegram !== null)
                    Actualizar
                @else
                    Guardar
                @endif
            </x-jet-button>

        </x-slot>

    </x-jet-form-section>

    @if($storedTelegram !== null)
        <x-jet-section-border />

        <div>
            <div class="overflow-x-auto">
                    <h3 class="text-lg font-medium text-gray-900">
                        <span class="mr-2">Datos actuales</span>
                        <button title="Eliminar" class="cursor-pointer text-red-500" wire:click="$set('destroyTelegramForm.id', '{{ $storedTelegram->id }}')" wire:loading.attr="disabled">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </button>

                    </h3>

                <div class="mt-2">
                    Token de inicio de sesión:  <span class="mt-1 text-sm text-gray-600">{{ $storedTelegram->bot_token ?? 'No hay' }}</span>
                </div>
                <div class="mt-1">
                    ID del chat: <span class="mt-1 text-sm text-gray-600">{{ $storedTelegram->chat_id ?? 'No hay' }}</span>
                </div>

                <x-confirmation-modal wire:model="destroyTelegramForm.id">
                    <x-slot name="title">Eliminar Telegram</x-slot>

                    <x-slot name="content">
                        @if ($destroyTelegramForm['id'])
                            ¿Desea eliminar el Bot de Telegram?
                        @endif
                    </x-slot>
                
                    <x-slot name="footer">
                        @error('destroyTelegram')
                            <x-action-error-message :message="$message"/>
                        @enderror
                        <x-jet-secondary-button wire:loading.attr="disabled" x-on:click="show = false">
                            {{ __('Cancel') }}
                        </x-jet-secondary-button>
                        <x-jet-button class="ml-3" wire:click="destroyTelegram">
                            {{ __('Remove') }}
                        </x-jet-button>
                    </x-slot>
                </x-confirmation-modal>
            </div>
        </div>

    @endif

    

</div>