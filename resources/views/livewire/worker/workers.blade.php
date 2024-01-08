<div>

    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Worker') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-xl sm:rounded-lg">
                <div class="p-6 flex flex-wrap">
                    {{-- start here --}}
                    <div class="p-2 w-full">
                        <div class="h-full border-2 border-gray-200 border-opacity-60 rounded-lg overflow-hidden p-7">
                            <h2 class="tracking-widest text-xs title-font mb-1 uppercase text-left">
                                Registrar
                            </h2>
                            <div
                                class="w-full md:w-4/5 mx-auto bg-white shadow-lg border border-gray-200 rounded-lg mt-4">
                                <div class="p-4">
                                    <div class="relative overflow-auto">
                                        <div class="flex items-stretch gap-4 w-full">
                                            <div class="w-1/3">
                                                <x-jet-label for="name" value="{{ __('Name') }}" />
                                                <x-jet-input id="name" class="block mt-1 w-full" type="text" name="name"
                                                    autocomplete="new-name" required />
                                            </div>
                                            <div class="w-1/3">
                                                <x-jet-label for="proxy_location" value="{{ __('Proxy location') }}" />
                                                <select name="proxy_location" id="proxy_location"
                                                    class="border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm block mt-1 cursor-pointer w-full"
                                                    required>
                                                    <option value="" class="hidden"></option>
                                                    <option value="bra">{{ __('Brazil') }}</option>
                                                    <option value="col">{{ __('Colombia') }}</option>
                                                    <option value="usa">{{ __('United States') }}</option>
                                                    <option value="ven">{{ __('Venezuela') }}</option>
                                                    <option value="none">{{ __('Without proxy')}}</option>
                                                </select>
                                            </div>
                                            <div class="w-1/3">
                                                <x-jet-label for="execution_location"
                                                    value="{{ __('Execution location') }}" />
                                                <select name="execution_location" id="execution_location"
                                                    class="border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm block mt-1 cursor-pointer w-full"
                                                    required>
                                                    <option value="" class="hidden"></option>
                                                    <option value="server">{{ __('Server') }}</option>
                                                    <option value="remote">{{ __('Remote') }}</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div class="flex items-stretch gap-4 w-full mt-4">
                                            <div class="p-3 w-full">
                                                <x-jet-label for="execution_location" value="{{ __('Accounts') }}" />
                                                <div class="overflow-x-auto">
                                                    <table class="table-auto w-full text-center">
                                                        <thead
                                                            class="text-xs font-semibold uppercase text-gray-400 bg-gray-50">
                                                            <tr>
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
                                                                    <div class="font-semibold ">Agregar</div>
                                                                </th>

                                                            </tr>
                                                        </thead>
                                                        <tbody class="text-sm divide-y divide-gray-100">
                                                            <tr>
                                                                <td class="p-2 whitespace-nowrap">
                                                                    <div>example@example.com</div>
                                                                </td>
                                                                <td class="p-2 whitespace-nowrap">
                                                                    <div>12345678</div>
                                                                </td>

                                                                <td class="p-2 whitespace-nowrap">
                                                                    <div>Venezuela</div>
                                                                </td>
                                                                <td class="p-2 whitespace-nowrap">
                                                                    <div>Sí</div>
                                                                </td>
                                                                <td class="p-2 whitespace-nowrap">
                                                                    <div>
                                                                        <x-jet-checkbox id="remember_me"
                                                                            class="cursor-pointer" name="remember" />
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                        </div>
                                        <div class="flex items-stretch w-full justify-center text-center mt-8">
                                            <x-jet-button class="ml-4">
                                                {{ __('Save') }}
                                            </x-jet-button>
                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>


                    </div>


                    {{-- end here --}}
                </div>
            </div>
        </div>

    </div>
</div>
