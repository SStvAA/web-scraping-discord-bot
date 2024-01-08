<?php

namespace App\Http\Livewire\Account;

use Livewire\Component;
use App\Models\Account;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\QueryException;

class Accounts extends Component
{

    public $form, $locations, $accounts, $deleteAccountForm;

    /**
     * Rules of form validation
     */
    protected $rules = [
        'form.email' => [
            'required',
            'email',
            'max:255',
            'unique:accounts,email'
        ],
        'form.password' => [
            'required',
            'min:5',
            'max:255',
            'string'
        ],
        'form.location' => [
            'required',
            'in_array:locations.*'
        ],
        'form.have_filters' => [
            'required',
            'in:true,false'
        ]
    ];

    protected $validationAttributes = [
        'form.email' => 'correo electrónico',
        'form.password' => 'contraseña',
        'form.location' => 'ubicación',
        'form.have_filters' => 'tiene filtros'
    ];

    /**
     * Set the initial input values on the form 
     */
    public function mount(){
        $this->resetStoreAccountForm();
        $this->resetRemoveAccountForm();
        $this->getSavedAccounts();
    }

    public function render(){
        return view('livewire.account.accounts');
    }

    /**
     * Store the form
     */
    public function storeAccount(){
        $this->validate();
        $this->resetValidation();

        try{
            $account = new Account;
            $account->email = $this->form['email'];
            $account->password = $this->form['password'];
            $account->location = $this->form['location'];
            $account->have_filters = $this->form['have_filters'] === 'true' ? true : false;
            $account->save();
        }catch(QueryException){
            return $this->addError('saveAccount', 'Server Error');
        }
        $this->emit('savedAccount');
        $this->resetStoreAccountForm();
        $this->getSavedAccounts();

    }

    /**
     * Remove account
     */
    public function destroyAccount($email = NULL){
        try{
            try{
                $emailToDelete = $email ?: $this->deleteAccountForm['email'];
                Account::where('email', '=', $emailToDelete)->firstOrFail()->delete();

            }catch(QueryException | ModelNotFoundException $error){
                return $this->addError('destroyAccount', 'Database error');
            }
        }catch(Exception $error){
            return $this->addError('destroyAccount', 'Server Error');
        }
        
        $this->resetRemoveAccountForm();
        $this->getSavedAccounts();

    }


    /**
     * Reset the form fields
     */
    private function resetStoreAccountForm(){
        $this->fill([
            'form' => [
                'email' => '',
                'password' => '',
                'location' => '',
                'have_filters' => '',
            ],
            'locations' => [
                [
                    'code' => 'bra',
                    'name' => 'Brazil'
                ],
                [
                    'code' => 'col',
                    'name' => 'Colombia'
                ],
                [
                    'code' => 'usa',
                    'name' => 'United States'
                ],
                [
                    'code' => 'ven',
                    'name' => 'Venezuela'
                ]
            ]
        ]);

    }

    /**
     * Reset the form field of remove account
     */
    private function resetRemoveAccountForm(){
        $this->fill([
            'deleteAccountForm' => [
                'email' => false
            ]
        ]);
    }

    public function getSavedAccounts(){
        $this->accounts = Account::all();
        return $this->accounts;
    }

}
