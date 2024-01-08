<x-slot name="header">
    <h2 class="font-semibold text-xl text-gray-800 leading-tight">
        {{ __('Account') }}
    </h2>
</x-slot>

{{-- start here --}}
<div class="w-full">
    <x-jet-form-section submit="storeAccount">
        <x-slot name="title">
            {{ __('Account Information') }}
        </x-slot>

        <x-slot name="description">
            {{ __('Ensure your Appen account information is up to date.') }}
        </x-slot>

        <x-slot name="form">

            <div class="col-span-6 sm:col-span-4">
                <x-jet-label for="email" value="{{ __('Email') }}" />
                <x-jet-input id="email" type="text" class="mt-1 block w-full" wire:model.defer="form.email"
                    autocomplete="off" required/>
                <x-jet-input-error for="form.email" class="mt-2" />
            </div>

            <div class="col-span-6 sm:col-span-4">
                <x-jet-label for="password" value="{{ __('Password') }}" />
                <x-jet-input id="password" type="text" class="mt-1 block w-full" wire:model.defer="form.password"
                    autocomplete="off"  required/>
                <x-jet-input-error for="form.password" class="mt-2" />
            </div>

            <div class="col-span-6 sm:col-span-4">
                <x-jet-label for="location" value="{{ __('Location') }}" />
                <select id="location" wire:model.defer="form.location"
                    class="mt-1 block w-full border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm" required>
                    <option value="" class="hidden"></option>
                    @foreach ($locations as $location)
                        <option value="{{ $location['code'] }}">
                            {{ __($location['name']) }}
                        </option>
                    @endforeach
                </select>
                <x-jet-input-error for="form.location" class="mt-2" />
            </div>

            <div class="col-span-6 sm:col-span-4">
                <x-jet-label for="have_filters" value="{{ __('Have filters') }}" />
                <select id="have_filters" wire:model.defer="form.have_filters"
                    class="mt-1 block w-full border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm" required>
                    <option value="" class="hidden"></option>
                    <option value="true">{{ __('Yes') }}</option>
                    <option value="false">{{ __('No') }}</option>
                </select>
                <x-jet-input-error for="form.have_filters" class="mt-2" />
            </div>

        </x-slot>

        <x-slot name="actions">

            @error('saveAccount')
                <x-action-error-message :message="$message"/>
            @enderror


            <x-jet-action-message class="mr-3" on="savedAccount">
                {{ __('Saved.') }}
            </x-jet-action-message>
    
            <x-jet-button>
                {{ __('Save') }}
            </x-jet-button>

        </x-slot>



    </x-jet-form-section>

    <x-jet-section-border />

    <div>
        <div class="overflow-x-auto">
            <table class="table-auto w-full text-center">
                <thead class="text-xs font-semibold uppercase text-gray-400 bg-gray-50">
                    <tr>
                        <th class="p-2 whitespace-nowrap">
                            <div class="font-semibold ">#</div>
                        </th>
                        <th class="p-2 whitespace-nowrap">
                            <div class="font-semibold ">Correo electrónico</div>
                        </th>
                        <th class="p-2 whitespace-nowrap">
                            <div class="font-semibold ">Contraseña</div>
                        </th>
                        <th class="p-2 whitespace-nowrap">
                            <div class="font-semibold ">Ubicación</div>
                        </th>
                        <th class="p-2 whitespace-nowrap">
                            <div class="font-semibold ">Tiene filtros</div>
                        </th>
                        <th class="p-2 whitespace-nowrap">
                            <div class="font-semibold ">Acciones</div>
                        </th>
                        
                    </tr>
                </thead>
                <tbody class="text-sm divide-y divide-gray-100">
                    @forelse ($accounts as $account)
                        <tr>
                            <td class="p-2 whitespace-nowrap">
                                <div>{{ $loop->iteration }}</div>
                            </td>
                            <td class="p-2 whitespace-nowrap">
                                <div>{{ $account->email }}</div>
                            </td>
                            <td class="p-2 whitespace-nowrap">
                                <div>{{ $account->password }}</div>
                            </td>
    
                            <td class="p-2 whitespace-nowrap">
                                <div>{{ Str::upper($account->location)}}</div>
                            </td>
                            <td class="p-2 whitespace-nowrap">
                                <div>{{ $account->have_filters ? 'Sí' : 'No'}}</div>
                            </td>
                            <td class="p-2 whitespace-nowrap">
                                <div>
                                    <button title="Eliminar" class="cursor-pointer text-red-500" wire:click="$set('deleteAccountForm.email', '{{ $account->email }}')" wire:loading.attr="disabled">
                                        <svg xmlns="http://www.w3.org/2000/svg"
                                            class="h-6 w-6 inline" fill="none" viewBox="0 0 24 24"
                                            stroke="currentColor" stroke-width="2">
                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>

                    @empty
                        <tr>
                            <td colspan="6" class="p-3">
                                <span class="text-sm text-gray-600">
                                    Sin registros
                                </span>
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
           
            <x-confirmation-modal closing-event="deletedAccount" wire:model="deleteAccountForm.email">
                <x-slot name="title">Eliminar Cuenta</x-slot>

                <x-slot name="content">
                    @if ($deleteAccountForm['email'])
                        ¿Desea eliminar la cuenta <b>{{ $deleteAccountForm['email'] }}</b>?
                    @endif
                </x-slot>
               
                <x-slot name="footer">
                    @error('destroyAccount')
                        <x-action-error-message :message="$message"/>
                    @enderror
                    <x-jet-secondary-button wire:loading.attr="disabled" x-on:click="show = false">
                        {{ __('Cancel') }}
                    </x-jet-secondary-button>
                    <x-jet-button class="ml-3" wire:click="destroyAccount">
                        {{ __('Remove') }}
                    </x-jet-button>
                </x-slot>
            </x-confirmation-modal>

            {{-- <x-jet-confirmation-modal wire:model="destroyModal.email" x-on:destroyedAccount="show = false">
                
            </x-jet-confirmation-modal> --}}
        </div>
        



    </div>

    





</div>
{{-- end here --}}
