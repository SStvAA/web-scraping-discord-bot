<x-slot name="header">
    <h2 class="font-semibold text-xl text-gray-800 leading-tight">
        Proxy
    </h2>
</x-slot>

{{-- start here --}}
<div class="w-full">
    <x-jet-form-section submit="storeProxy">

        <x-slot name="title">
            Información del Proxy
        </x-slot>

        <x-slot name="description">
            Asegúrese de que la información de su cuenta de Proxy está actualizada.
            <br>
            Para establecer un único proxy por ubicación, debe establecer la hora de inicio en 12:00 am y la hora de finalización en 11:59 pm.
        </x-slot>
        <x-slot name="form">
            <div class="col-span-2">
                <x-jet-label for="location" value="Ubicación" />
                <select name="location" id="location" wire:model.defer="storeProxyForm.location"
                    class="border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm block mt-1 cursor-pointer w-full"
                    required>
                    <option value="" class="hidden"></option>
                    <option value="bra">Brasil</option>
                    <option value="col">Colombia</option>
                    <option value="usa">Estados Unidos</option>
                    <option value="ven">Venezuela</option>
                </select>
                <x-jet-input-error for="storeProxyForm.location" class="mt-2" />
            </div>

            <div class="col-span-2">
                <x-jet-label for="ip_address" value="Dirección IP" />
                <x-jet-input id="ip_address" class="block mt-1 w-full" type="text" name="ip_address" autocomplete="off" wire:model.defer="storeProxyForm.ip_address"
                    required />
                <x-jet-input-error for="storeProxyForm.ip_address" class="mt-2" />

            </div>

            <div class="col-span-2">
                <x-jet-label for="port" value="Puerto" />
                <x-jet-input id="port" class="block mt-1 w-full" type="text" name="port" autocomplete="off" required wire:model.defer="storeProxyForm.port" />
                <x-jet-input-error for="storeProxyForm.port" class="mt-2" />

            </div>

            <div class="col-span-3">
                <x-jet-label for="username" value="Usuario" />
                <x-jet-input id="username" class="block mt-1 w-full" type="text" name="username" wire:model.defer="storeProxyForm.username"
                    autocomplete="new-username" required />
                <x-jet-input-error for="storeProxyForm.username" class="mt-2" />
            </div>

            <div class="col-span-3">
                <x-jet-label for="password" value="Contraseña" />
                <x-jet-input id="password" class="block mt-1 w-full" type="text" name="password" wire:model.defer="storeProxyForm.password"
                    autocomplete="new-password" required />
                <x-jet-input-error for="storeProxyForm.password" class="mt-2" />

            </div>

            <div class="col-span-3">
                <x-jet-label for="start_time" value="Hora de inicio" />
                <x-jet-input id="start_time" class="block mt-1 w-full" type="time" name="start_time" required wire:model.defer="storeProxyForm.start_time" />
                <x-jet-input-error for="storeProxyForm.start_time" class="mt-2" />

            </div>

            <div class="col-span-3">
                <x-jet-label for="end_time" value="Hora de fin" />
                <x-jet-input id="end_time" class="block mt-1 w-full" type="time" name="end_time" required wire:model.defer="storeProxyForm.end_time" />
                <x-jet-input-error for="storeProxyForm.end_time" class="mt-2" />
            </div>

        </x-slot>

        <x-slot name="actions">
            @error('storeProxy')
            <x-action-error-message :message="$message" />
            @enderror

            <x-jet-action-message class="mr-3" on="proxyStored">
                Guardado.
            </x-jet-action-message>

            <x-jet-button>
                Guardar
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
                            <div class="font-semibold ">Ubicación</div>
                        </th>
                        <th class="p-2 whitespace-nowrap">
                            <div class="font-semibold ">Dirección IP</div>
                        </th>
                        <th class="p-2 whitespace-nowrap">
                            <div class="font-semibold ">Puerto</div>
                        </th>
                        <th class="p-2 whitespace-nowrap">
                            <div class="font-semibold ">Usuario</div>
                        </th>
                        <th class="p-2 whitespace-nowrap">
                            <div class="font-semibold ">Contraseña</div>
                        </th>
                        <th class="p-2 whitespace-nowrap">
                            <div class="font-semibold">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 inline" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                inicio

                            </div>
                        </th>
                        <th class="p-2 whitespace-nowrap">
                            <div class="font-semibold ">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 inline" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                fin
                            </div>
                        </th>
                        <th class="p-2 whitespace-nowrap">
                            <div class="font-semibold ">Acciones</div>
                        </th>
                    </tr>
                </thead>
                <tbody class="text-sm divide-y divide-gray-100">
                    @forelse ($storedProxies as $proxy)
                        <tr>
                            <td class="p-2 whitespace-nowrap">
                                <div> {{ Str::upper($proxy->location) }}</div>
                            </td>
                            <td class="p-2 whitespace-nowrap">
                                <div> {{ $proxy->ip_address }}</div>
                            </td>
                            <td class="p-2 whitespace-nowrap">
                                <div> {{ $proxy->port }}</div>
                            </td>
                            <td class="p-2 whitespace-nowrap">
                                <div> {{ $proxy->username }}</div>
                            </td>
                            <td class="p-2 whitespace-nowrap">
                                <div> {{ $proxy->password }}</div>
                            </td>
                            <td class="p-2 whitespace-nowrap">
                                <div> {{ Str::limit($proxy->start_range_time, 5, '') }}</div>
                            </td>
                            <td class="p-2 whitespace-nowrap">
                                <div> {{ Str::limit($proxy->end_range_time, 5, '') }}</div>
                            </td>
                            <td class="p-2 whitespace-nowrap">
                                <div>
                                    <button title="Eliminar" class="cursor-pointer text-red-500" wire:click="$set('destroyProxyForm.ip_address', '{{ $proxy->ip_address }}')" wire:loading.attr="disabled">
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
                        <td colspan="8" class="p-3">
                            <span class="text-sm text-gray-600">
                                Sin registros
                            </span>
                        </td>
                    </tr>

                    @endforelse
                </tbody>
            </table>

            <x-confirmation-modal wire:model="destroyProxyForm.ip_address">
                <x-slot name="title">Eliminar Proxy</x-slot>

                <x-slot name="content">
                    @if ($destroyProxyForm['ip_address'])
                        ¿Desea eliminar el proxy con dirección IP <b>{{ $destroyProxyForm['ip_address'] }}</b>?
                    @endif
                </x-slot>
               
                <x-slot name="footer">
                    @error('destroyProxy')
                        <x-action-error-message :message="$message"/>
                    @enderror
                    <x-jet-secondary-button wire:loading.attr="disabled" x-on:click="show = false">
                        {{ __('Cancel') }}
                    </x-jet-secondary-button>
                    <x-jet-button class="ml-3" wire:click="destroyProxy">
                        {{ __('Remove') }}
                    </x-jet-button>
                </x-slot>
            </x-confirmation-modal>

        </div>
    </div>

</div>
